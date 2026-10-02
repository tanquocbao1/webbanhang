import pool from '../src/config/db.js';

async function checkAndMigrate() {
    try {
        console.log('Connecting...');
        const resTables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Current tables:', resTables.rows.map(r => r.table_name));

        // 1. Update orders status check constraint to include 'processing'
        await pool.query(`
            DO $$
            BEGIN
                ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
                ALTER TABLE orders ADD CONSTRAINT orders_status_check 
                    CHECK (status IN ('pending', 'processing', 'shipping', 'completed', 'cancelled'));
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END $$;
        `);
        console.log('✅ orders_status_check updated.');

        // 2. Update users role check constraint to include 'warehouse', 'sales'
        await pool.query(`
            DO $$
            BEGIN
                ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
                ALTER TABLE users ADD CONSTRAINT users_role_check 
                    CHECK (role IN ('admin', 'customer', 'warehouse', 'sales'));
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END $$;
        `);
        console.log('✅ users_role_check updated.');

        // 3. Create installments table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS installments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
                customer_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                id_card VARCHAR(20),
                address TEXT,
                method VARCHAR(50) DEFAULT 'finance',
                term_months INTEGER NOT NULL,
                prepaid_percent NUMERIC(5, 2) DEFAULT 0,
                prepaid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
                monthly_payment NUMERIC(15, 2) NOT NULL DEFAULT 0,
                total_payment NUMERIC(15, 2) NOT NULL DEFAULT 0,
                status VARCHAR(30) NOT NULL DEFAULT 'pending' 
                    CHECK (status IN ('pending', 'approved', 'need_info', 'rejected')),
                admin_notes TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ installments table ensured.');

        // 4. Create support_contacts table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS support_contacts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                subject VARCHAR(200),
                message TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pending' 
                    CHECK (status IN ('pending', 'processed')),
                admin_reply TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ support_contacts table ensured.');

        // 5. Create vouchers table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vouchers (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                title VARCHAR(200) NOT NULL,
                discount_percent INTEGER DEFAULT 0,
                discount_amount NUMERIC(15, 2) DEFAULT 0,
                min_order_amount NUMERIC(15, 2) DEFAULT 0,
                max_discount NUMERIC(15, 2) DEFAULT 0,
                usage_limit INTEGER DEFAULT 100,
                used_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                expires_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ vouchers table ensured.');

        // 6. Insert sample data if tables are empty
        const instCount = await pool.query('SELECT count(*) FROM installments');
        if (parseInt(instCount.rows[0].count) === 0) {
            // Find a product
            const pRes = await pool.query('SELECT id, name, price FROM products LIMIT 3');
            if (pRes.rows.length > 0) {
                const p1 = pRes.rows[0];
                const p2 = pRes.rows[1] || pRes.rows[0];
                const pr1 = parseFloat(p1.price);
                const pr2 = parseFloat(p2.price);
                await pool.query(`
                    INSERT INTO installments 
                    (product_id, customer_name, phone, id_card, address, method, term_months, prepaid_percent, prepaid_amount, monthly_payment, total_payment, status, admin_notes)
                    VALUES 
                    ($1, 'Nguyễn Văn Minh', '0912345678', '079201004567', '45 Lê Duẩn, Q1, TP.HCM', 'finance', 6, 20, $2, $3, $4, 'pending', 'Khách hàng có công việc ổn định, chờ duyệt hồ sơ HD Saison'),
                    ($5, 'Trần Thị Mai', '0987654321', '079302008912', '128 Cầu Giấy, Hà Nội', 'credit_card', 12, 0, 0, $6, $7, 'approved', 'Đã xác nhận thẻ tín dụng VPBank thành công'),
                    ($1, 'Lê Hoàng Nam', '0903332211', '079198007788', '89 Nguyễn Thị Minh Khai, Đà Nẵng', 'finance', 9, 30, $8, $9, $10, 'need_info', 'Cần bổ sung thêm ảnh CCCD mặt sau rõ nét')
                `, [
                    p1.id, 
                    Math.round(pr1 * 0.2), Math.round((pr1 * 0.8 * 1.05) / 6), Math.round(pr1 * 1.04),
                    p2.id,
                    Math.round(pr2 / 12), Math.round(pr2),
                    Math.round(pr1 * 0.3), Math.round((pr1 * 0.7 * 1.07) / 9), Math.round(pr1 * 1.05)
                ]);
                console.log('✅ Sample installments inserted.');
            }
        }

        const suppCount = await pool.query('SELECT count(*) FROM support_contacts');
        if (parseInt(suppCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO support_contacts (name, email, phone, subject, message, status, admin_reply)
                VALUES 
                ('Lê Quốc Bảo', 'baole@gmail.com', '0934112233', 'Tư vấn mua trả góp 0%', 'Chào shop, mình muốn hỏi thủ tục trả góp thẻ Sacombank có mất phí chuyển đổi không?', 'pending', NULL),
                ('Phạm Thùy Linh', 'thuylinh99@yahoo.com', '0918889900', 'Bảo hành điện thoại', 'Máy iPhone 15 Pro Max mình mua tuần trước bị lỗi sạc không vào, shop hỗ trợ đổi mới được không?', 'processed', 'Đã liên hệ khách hàng hẹn mang máy đến cửa hàng để thẩm định và đổi máy mới.'),
                ('Hoàng Đức Anh', 'ducanh.dev@gmail.com', '0977221144', 'Hỏi về thời gian giao hàng', 'Đơn hàng của mình ở Cần Thơ thì khoảng mấy ngày nhận được hàng vậy shop?', 'pending', NULL)
            `);
            console.log('✅ Sample support contacts inserted.');
        }

        const voucherCount = await pool.query('SELECT count(*) FROM vouchers');
        if (parseInt(voucherCount.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO vouchers (code, title, discount_percent, discount_amount, min_order_amount, max_discount, usage_limit, used_count, is_active, expires_at)
                VALUES 
                ('CHAOMUNG2026', 'Giảm 10% cho khách hàng mới', 10, 0, 5000000, 1000000, 200, 14, true, NOW() + INTERVAL '30 days'),
                ('Bảo Sneaker500K', 'Giảm trực tiếp 500.000đ', 0, 500000, 15000000, 500000, 50, 8, true, NOW() + INTERVAL '15 days'),
                ('FLASHSALE', 'Flash Sale cuối tuần giảm 5%', 5, 0, 10000000, 800000, 100, 32, true, NOW() + INTERVAL '7 days')
            `);
            console.log('✅ Sample vouchers inserted.');
        }

        // Add extra sample staff users if not present
        const staffRes = await pool.query("SELECT email FROM users WHERE role IN ('warehouse', 'sales')");
        if (staffRes.rows.length === 0) {
            // bcrypt hash of 'admin123'
            const pwHash = '$2a$10$uQYHOLuwEBiDXT1QvR/rO.VaV5bIJXAz.NByc/.WLzmHAigfhGwEK';
            await pool.query(`
                INSERT INTO users (email, password_hash, role, full_name)
                VALUES 
                ('kho@Bảo Sneaker.com', $1, 'warehouse', 'Nguyễn Kho Vận'),
                ('sale@Bảo Sneaker.com', $1, 'sales', 'Trần Thu Sale')
                ON CONFLICT (email) DO NOTHING
            `, [pwHash]);
            console.log('✅ Staff users (warehouse, sales) created.');
        }

        // Also check if we can add a few more sample orders for realistic dashboard metrics
        const orderCount = await pool.query('SELECT count(*) FROM orders');
        if (parseInt(orderCount.rows[0].count) < 5) {
            const adminUser = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
            const prods = await pool.query("SELECT id, price FROM products LIMIT 5");
            if (adminUser.rows.length > 0 && prods.rows.length >= 3) {
                const uid = adminUser.rows[0].id;
                // Add sample completed and shipping orders
                const o1 = await pool.query(`
                    INSERT INTO orders (user_id, total_amount, shipping_address, status, created_at)
                    VALUES ($1, $2, '120 Hai Bà Trưng, Q1, TP.HCM', 'completed', NOW() - INTERVAL '2 days')
                    RETURNING id
                `, [uid, prods.rows[0].price]);
                await pool.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, 1, $3)`, 
                    [o1.rows[0].id, prods.rows[0].id, prods.rows[0].price]);

                const o2 = await pool.query(`
                    INSERT INTO orders (user_id, total_amount, shipping_address, status, created_at)
                    VALUES ($1, $2, '56 Nguyễn Trãi, Q5, TP.HCM', 'shipping', NOW() - INTERVAL '1 days')
                    RETURNING id
                `, [uid, prods.rows[1].price]);
                await pool.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, 1, $3)`, 
                    [o2.rows[0].id, prods.rows[1].id, prods.rows[1].price]);

                const o3 = await pool.query(`
                    INSERT INTO orders (user_id, total_amount, shipping_address, status, created_at)
                    VALUES ($1, $2, '78 Hoàng Hoa Thám, Ba Đình, Hà Nội', 'processing', NOW() - INTERVAL '12 hours')
                    RETURNING id
                `, [uid, prods.rows[2].price]);
                await pool.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, 1, $3)`, 
                    [o3.rows[0].id, prods.rows[2].id, prods.rows[2].price]);

                console.log('✅ Extra sample orders inserted for analytics.');
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (e) {
        console.error('Error during migration:', e);
        process.exit(1);
    }
}

checkAndMigrate();

