// ============================================================
//  src/services/order.service.js
//  *** ĐÂY LÀ FILE QUAN TRỌNG NHẤT CỦA LUỒNG CHECKOUT ***
//
//  Chứa toàn bộ logic nghiệp vụ:
//  - Kiểm tra hàng tồn kho
//  - Tạo đơn hàng + items trong 1 Transaction
//  - Trừ kho nguyên tử (atomic)
//  - Rollback nếu có bất kỳ lỗi nào
// ============================================================

import pool from '../config/db.js';

// Helper: tạo lỗi có thể đoán trước (lỗi nghiệp vụ)
// isOperational = true để Controller phân biệt với lỗi server
const createAppError = (message, statusCode = 400) => {
    const err = new Error(message);
    err.isOperational = true;
    err.statusCode = statusCode;
    return err;
};


// ============================================================
//  createOrder - LUỒNG CHECKOUT COD
//
//  Tham số:
//    userId          - ID của customer đang đặt hàng
//    shippingAddress - Địa chỉ giao hàng
//    items           - Mảng sản phẩm: [{ product_id, quantity }, ...]
//
//  Trả về: Thông tin đơn hàng vừa tạo
// ============================================================
export const createOrder = async ({
    userId,
    shippingAddress,
    items,
    phone = null,
    customerName = null,
    paymentMethod = 'cod',
    note = null,
}) => {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let totalAmount = 0;
        const enrichedItems = [];

        for (const item of items) {
            const productResult = await client.query(
                'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
                [item.product_id]
            );

            const product = productResult.rows[0];

            if (!product) {
                throw createAppError(`Sản phẩm với ID ${item.product_id} không tồn tại.`, 404);
            }

            if (product.stock_quantity < item.quantity) {
                throw createAppError(
                    `Sản phẩm "${product.name}" không đủ hàng. ` +
                    `Kho còn: ${product.stock_quantity}, bạn cần: ${item.quantity}.`,
                    409
                );
            }

            totalAmount += item.quantity * parseFloat(product.price);

            enrichedItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // ======================================================
        //  BƯỚC 3: TẠO ĐƠN HÀNG (INSERT vào bảng orders)
        // ======================================================
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_amount, shipping_address, status, phone, customer_name, payment_method, note)
             VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)
             RETURNING *`,
            [userId, totalAmount, shippingAddress, phone, customerName, paymentMethod, note]
        );

        const newOrder = orderResult.rows[0];

        // ======================================================
        //  BƯỚC 4: TẠO CHI TIẾT ĐƠN HÀNG (INSERT vào order_items)
        //          VÀ TRỪ TỒN KHO (UPDATE products)
        // ======================================================
        for (const item of enrichedItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [newOrder.id, item.product_id, item.quantity, item.price]
            );

            await client.query(
                `UPDATE products
                 SET stock_quantity = stock_quantity - $1
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // ======================================================
        //  BƯỚC 4.5: TỰ ĐỘNG TẠO THÔNG BÁO CHO USER VỀ ĐƠN HÀNG MỚI
        // ======================================================
        if (userId) {
            const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount);
            await client.query(
                `INSERT INTO user_notifications (user_id, title, message, type, reference_id)
                 VALUES ($1, $2, $3, 'order_status', $4)`,
                [
                    userId,
                    `Đặt hàng thành công đơn #${newOrder.id}`,
                    `Đơn hàng #${newOrder.id} (${enrichedItems.length} sản phẩm, tổng cộng: ${formattedTotal}) theo hình thức Thanh toán khi nhận hàng (COD) đã được tạo thành công. Nhân viên sẽ liên hệ và giao hàng tới địa chỉ: ${shippingAddress}.`,
                    newOrder.id
                ]
            );
        }

        // ======================================================
        //  BƯỚC 5: COMMIT TRANSACTION
        // ======================================================
        await client.query('COMMIT');

        return {
            ...newOrder,
            items: enrichedItems,
        };

    } catch (err) {
        // ======================================================
        //  XỬ LÝ LỖI: ROLLBACK TRANSACTION
        //
        //  Nếu bất kỳ bước nào ở trên thất bại (lỗi DB, hết hàng...),
        //  chúng ta PHẢI hủy toàn bộ thay đổi để đảm bảo:
        //  - Không tạo đơn hàng khi chưa trừ được kho
        //  - Không trừ kho khi chưa tạo được đơn hàng
        //  -> Dữ liệu luôn nhất quán (consistent)
        // ======================================================
        await client.query('ROLLBACK');
        console.error('🔄 Transaction bị rollback do lỗi:', err.message);

        // Ném lỗi lên lại để Controller xử lý và trả về cho Frontend
        throw err;

    } finally {
        // ======================================================
        //  QUAN TRỌNG: Luôn phải trả client về pool sau khi dùng
        //  dù thành công hay thất bại (finally luôn chạy)
        //  -> Tránh "rò rỉ" kết nối (connection leak)
        // ======================================================
        client.release();
    }
};


// ============================================================
//  getOrdersByUser
//  Lấy lịch sử đơn hàng của một customer
// ============================================================
export const getOrdersByUser = async (userId) => {
    // Lấy đơn hàng kèm chi tiết sản phẩm (JOIN 2 bảng)
    const result = await pool.query(
        `SELECT
            o.id            AS order_id,
            o.total_amount,
            o.shipping_address,
            o.status,
            o.created_at,
            -- Gom tất cả order_items của đơn hàng thành một mảng JSON
            json_agg(json_build_object(
                'product_id',   oi.product_id,
                'product_name', p.name,
                'quantity',     oi.quantity,
                'price',        oi.price
            )) AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p     ON p.id = oi.product_id
         WHERE o.user_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [userId]
    );
    return result.rows;
};


// ============================================================
//  getAllOrders - Dành cho Admin
//  Lấy tất cả đơn hàng kèm tên người đặt
// ============================================================
export const getAllOrders = async () => {
    const result = await pool.query(
        `SELECT
            o.id            AS order_id,
            o.total_amount,
            o.shipping_address,
            o.status,
            o.created_at,
            u.full_name     AS customer_name,
            u.email         AS customer_email,
            COALESCE(
                json_agg(
                    json_build_object(
                        'product_id',   oi.product_id,
                        'product_name', p.name,
                        'image_url',    p.image_url,
                        'quantity',     oi.quantity,
                        'price',        oi.price
                    )
                ) FILTER (WHERE oi.id IS NOT NULL), '[]'
            ) AS items
         FROM orders o
         LEFT JOIN users u ON u.id = o.user_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p     ON p.id = oi.product_id
         GROUP BY o.id, u.full_name, u.email
         ORDER BY o.created_at DESC`
    );
    return result.rows;
};


// ============================================================
//  updateOrderStatus - Dành cho Admin
//  Cập nhật trạng thái đơn hàng
// ============================================================
export const updateOrderStatus = async (orderId, status) => {
    const result = await pool.query(
        `UPDATE orders
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, orderId]
    );
    return result.rows[0]; // undefined nếu không tìm thấy orderId
};
