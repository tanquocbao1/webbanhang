// ============================================================
//  database/seed_mongo.js
//  Khởi tạo dữ liệu mẫu hoàn chỉnh vào MongoDB
// ============================================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';
import Product from '../src/models/product.model.js';
import Voucher from '../src/models/voucher.model.js';
import UserNotification from '../src/models/notification.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/phi_mobile_shop';

async function seedData() {
    try {
        console.log(`🔌 Đang kết nối tới MongoDB: ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công!');

        // 1. Dọn sạch dữ liệu cũ
        console.log('🧹 Đang làm sạch dữ liệu cũ trong collections...');
        await Promise.all([
            User.deleteMany({}),
            Product.deleteMany({}),
            Voucher.deleteMany({}),
            UserNotification.deleteMany({}),
        ]);

        // 2. Tạo tài khoản mẫu
        console.log('👤 Đang tạo tài khoản người dùng và quản trị viên...');
        const adminPasswordHash = await bcrypt.hash('admin123', 10);
        const userPasswordHash = await bcrypt.hash('123456', 10);

        const adminUser = await User.create({
            email: 'admin@baosneaker.com',
            password_hash: adminPasswordHash,
            full_name: 'Quản Trị Viên (Admin)',
            role: 'admin',
            phone: '0901234567',
            address: 'Hồ Chí Minh, Việt Nam',
        });

        // Tạo thêm admin@gmail.com để tương thích với login mẫu ở giao diện
        await User.create({
            email: 'admin@gmail.com',
            password_hash: userPasswordHash,
            full_name: 'Admin Demo',
            role: 'admin',
            phone: '0909999888',
            address: 'TP. Hồ Chí Minh',
        });

        const customerUser = await User.create({
            email: 'customer@gmail.com',
            password_hash: userPasswordHash,
            full_name: 'Nguyễn Văn Khách Hàng',
            role: 'customer',
            phone: '0912345678',
            address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        });

        // 3. Tạo sản phẩm mẫu
        console.log('👟📱 Đang tạo danh sách sản phẩm mẫu...');
        const sampleProducts = [
            // Sản phẩm điện thoại (Đồ án Mobile Shop)
            {
                custom_id: 1,
                name: 'iPhone 16 Pro Max 256GB Titan Tự Nhiên',
                brand: 'Apple',
                price: 34990000,
                stock_quantity: 45,
                sold: 15,
                category: 'Điện thoại',
                image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
                description: 'Chip A18 Pro mạnh mẽ, camera điều khiển nút bấm mới, màn hình 6.9 inch 120Hz ProMotion cao cấp.',
            },
            {
                custom_id: 2,
                name: 'Samsung Galaxy S24 Ultra 256GB',
                brand: 'Samsung',
                price: 29990000,
                stock_quantity: 30,
                sold: 20,
                category: 'Điện thoại',
                image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
                description: 'Khung titan sang trọng, bút S-Pen thông minh, tích hợp bộ công cụ quyền năng Galaxy AI.',
            },
            {
                custom_id: 3,
                name: 'Xiaomi 14 Pro 512GB Leica Optics',
                brand: 'Xiaomi',
                price: 19990000,
                stock_quantity: 25,
                sold: 8,
                category: 'Điện thoại',
                image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
                description: 'Ống kính quang học Leica Summilux đỉnh cao, sạc siêu tốc HyperCharge 120W.',
            },
            {
                custom_id: 4,
                name: 'iPhone 15 128GB Xanh Mint',
                brand: 'Apple',
                price: 19490000,
                stock_quantity: 50,
                sold: 35,
                category: 'Điện thoại',
                image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
                description: 'Dynamic Island tiện ích, camera 48MP sắc nét, cổng sạc USB-C phổ thông hiện đại.',
            },
            // Sản phẩm giày thể thao (SneakerX)
            {
                custom_id: 5,
                name: 'Nike Zoom Mercurial Superfly 10 FG',
                brand: 'Nike',
                price: 6500000,
                stock_quantity: 18,
                sold: 12,
                category: 'Giày Đá Banh',
                image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=80',
                description: 'Đế đinh FG bám sân cỏ tự nhiên, sợi dệt Flyknit ôm chân tốc độ cao chuyên nghiệp.',
            },
            {
                custom_id: 6,
                name: 'Adidas Predator Accuracy.1 Low',
                brand: 'Adidas',
                price: 5900000,
                stock_quantity: 14,
                sold: 9,
                category: 'Giày Đá Banh',
                image_url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80',
                description: 'Công nghệ High-Definition Grip kiểm soát bóng tối đa từng pha chạm bóng.',
            },
            {
                custom_id: 7,
                name: 'Nike Air Max 270 React Red Orange',
                brand: 'Nike',
                price: 3500000,
                stock_quantity: 25,
                sold: 21,
                category: 'Thời trang',
                image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
                description: 'Đệm khí Air Max cực êm ái, phối màu đỏ cam thể thao năng động trẻ trung.',
            },
            {
                custom_id: 8,
                name: 'Adidas Ultraboost 22 Running Boost',
                brand: 'Adidas',
                price: 4200000,
                stock_quantity: 15,
                sold: 16,
                category: 'Chạy bộ',
                image_url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80',
                description: 'Đế đệm Boost hoàn trả năng lượng tối ưu cho đường chạy cự ly dài thoải mái.',
            },
            {
                custom_id: 9,
                name: 'Puma Future Ultimate FG/AG Blue',
                brand: 'Puma',
                price: 5200000,
                stock_quantity: 8,
                sold: 7,
                category: 'Giày Đá Banh',
                image_url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
                description: 'Dải nén FUZIONFIT360 thích ứng khóa chặt chân khi bứt tốc đổi hướng.',
            },
            {
                custom_id: 10,
                name: 'Air Jordan 1 Retro High OG Men',
                brand: 'Nike',
                price: 4800000,
                stock_quantity: 11,
                sold: 18,
                category: 'Thời trang',
                image_url: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=600&q=80',
                description: 'Phong cách kinh điển, chất liệu da thật cao cấp, đế đệm Air êm ái cho mọi phong cách.',
            },
        ];

        await Product.insertMany(sampleProducts);

        // 4. Tạo mã giảm giá mẫu
        console.log('🏷️ Đang tạo voucher khuyến mãi...');
        await Voucher.insertMany([
            {
                code: 'BAOSNEAKER10',
                title: 'Giảm 10% tối đa 500K cho đơn từ 1 triệu',
                discount_percent: 10,
                max_discount: 500000,
                min_order_amount: 1000000,
                usage_limit: 200,
            },
            {
                code: 'GIAM100K',
                title: 'Giảm ngay 100.000đ cho đơn từ 500K',
                discount_amount: 100000,
                min_order_amount: 500000,
                usage_limit: 100,
            },
            {
                code: 'CHAOBANMOI',
                title: 'Ưu đãi thành viên mới giảm 50.000đ',
                discount_amount: 50000,
                min_order_amount: 200000,
                usage_limit: 500,
            },
        ]);

        // 5. Tạo thông báo mẫu cho customer
        console.log('🔔 Đang tạo thông báo mẫu...');
        await UserNotification.create({
            user_id: customerUser._id,
            title: 'Chào mừng bạn đến với hệ thống!',
            message: 'Chúc mừng bạn đã kích hoạt tài khoản thành công. Tặng bạn mã CHAOBANMOI giảm 50K khi đặt hàng đầu tiên.',
            type: 'promo',
        });

        console.log('\n======================================================');
        console.log('🎉 KHỞI TẠO DỮ LIỆU MONGODB THÀNH CÔNG RỰC RỠ!');
        console.log('======================================================');
        console.log('🔑 Tài khoản Quản trị (Admin):');
        console.log('   - Email: admin@baosneaker.com (hoặc admin@gmail.com)');
        console.log('   - Password: admin123 (hoặc 123456)');
        console.log('🔑 Tài khoản Khách hàng (Customer):');
        console.log('   - Email: customer@gmail.com');
        console.log('   - Password: 123456');
        console.log('======================================================\n');
    } catch (err) {
        console.error('❌ Lỗi seed data MongoDB:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seedData();
