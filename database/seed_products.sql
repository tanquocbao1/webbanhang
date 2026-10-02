-- ================================================================
--  SEED DATA Bảo Sneaker - ANH CHINH HANG THE GIOI DI DONG LOCAL
-- ================================================================

TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders      RESTART IDENTITY CASCADE;
TRUNCATE TABLE products    RESTART IDENTITY CASCADE;

-- ================================================================
--  APPLE – 20 san pham
-- ================================================================
INSERT INTO products (name, brand, price, stock_quantity, image_url, description) VALUES
('iPhone 16 Pro Max 256GB', 'Apple', 36990000.00, 50, '/images/products/apple/1.jpg', 'Chip A18 Pro, màn hình ProMotion 6.9 inch Super Retina XDR 120Hz, camera 48MP Fusion zoom quang học 5x, cổng USB-C 3, pin 4685mAh, hỗ trợ Apple Intelligence, thiết kế titan cao cấp'),

('iPhone 16 Pro Max 512GB', 'Apple', 42990000.00, 25, '/images/products/apple/2.jpg', 'Chip A18 Pro, màn hình ProMotion 6.9 inch 120Hz, camera 48MP zoom 5x, bộ nhớ 512GB, cổng USB-C 3, pin 4685mAh, hỗ trợ Apple Intelligence và Camera Control mới'),

('iPhone 16 Pro 256GB', 'Apple', 30990000.00, 40, '/images/products/apple/3.jpg', 'Chip A18 Pro, màn hình ProMotion 6.3 inch 120Hz, camera 48MP zoom 5x, cổng USB-C 3, thiết kế titan, Camera Control, hỗ trợ Apple Intelligence'),

('iPhone 16 Plus 256GB', 'Apple', 28990000.00, 35, '/images/products/apple/4.jpg', 'Chip A18, màn hình 6.7 inch Super Retina XDR, camera 48MP Fusion, Camera Control, Dynamic Island, pin siêu bền cả ngày, iOS 18'),

('iPhone 16 128GB', 'Apple', 22990000.00, 60, '/images/products/apple/5.png', 'Chip A18, màn hình 6.1 inch Super Retina XDR, camera 48MP Fusion, Camera Control, cổng USB-C, Dynamic Island, hỗ trợ Apple Intelligence'),

('iPhone 15 Pro Max 256GB', 'Apple', 34990000.00, 45, '/images/products/apple/6.jpg', 'Chip A17 Pro, màn hình 6.7 inch ProMotion 120Hz, camera 48MP zoom 5x, khung titan, cổng USB-C, Dynamic Island, Action Button, pin 4422mAh'),

('iPhone 15 Pro 256GB', 'Apple', 29990000.00, 40, '/images/products/apple/7.jpg', 'Chip A17 Pro, màn hình 6.1 inch ProMotion 120Hz, camera 48MP zoom 3x, khung titan tự nhiên, cổng USB-C, Dynamic Island, Action Button'),

('iPhone 15 Plus 128GB', 'Apple', 24990000.00, 30, '/images/products/apple/8.jpg', 'Chip A16 Bionic, màn hình 6.7 inch Super Retina XDR, camera 48MP, Dynamic Island, cổng USB-C, pin siêu trâu 4383mAh, iOS 17'),

('iPhone 15 128GB', 'Apple', 19990000.00, 70, '/images/products/apple/9.jpg', 'Chip A16 Bionic, màn hình 6.1 inch Super Retina XDR, camera 48MP, Dynamic Island, cổng USB-C, màu sắc tươi sáng, iOS 17'),

('iPhone 14 Pro Max 256GB', 'Apple', 27990000.00, 30, '/images/products/apple/10.jpg', 'Chip A16 Bionic, màn hình 6.7 inch ProMotion Always-On Display, Dynamic Island, camera 48MP, khung thép, Emergency SOS vệ tinh'),

('iPhone 14 Pro 256GB', 'Apple', 24490000.00, 25, '/images/products/apple/11.jpg', 'Chip A16 Bionic, màn hình 6.1 inch ProMotion Always-On, Dynamic Island, camera 48MP, khung thép không gỉ, Emergency SOS qua vệ tinh'),

('iPhone 14 128GB', 'Apple', 16990000.00, 50, '/images/products/apple/12.jpg', 'Chip A15 Bionic, màn hình 6.1 inch Super Retina XDR, camera kép 12MP, Crash Detection, Emergency SOS qua vệ tinh, thiết kế nhôm màu sắc đẹp'),

('iPhone 13 Pro Max 256GB', 'Apple', 22490000.00, 20, '/images/products/apple/13.jpg', 'Chip A15 Bionic, màn hình 6.7 inch ProMotion LTPO 120Hz, camera 12MP zoom 3x, pin 4352mAh, khung thép, iOS 16'),

('iPhone 13 128GB', 'Apple', 14990000.00, 45, '/images/products/apple/14.jpg', 'Chip A15 Bionic, màn hình 6.1 inch Super Retina XDR, camera kép 12MP Cinematic Mode, pin bền hơn 2.5 giờ, thiết kế nhôm premium'),

('iPhone 13 mini 128GB', 'Apple', 12990000.00, 25, '/images/products/apple/15.jpg', 'Chip A15 Bionic, màn hình 5.4 inch Super Retina XDR, camera kép 12MP Cinematic Mode, thiết kế nhỏ gọn nhất, hỗ trợ 5G'),

('iPhone 12 64GB', 'Apple', 9990000.00, 30, '/images/products/apple/16.jpg', 'Chip A14 Bionic, màn hình 6.1 inch OLED Super Retina XDR, camera kép 12MP Night Mode, 5G, MagSafe, Ceramic Shield chống vỡ'),

('iPhone 12 mini 64GB', 'Apple', 8490000.00, 20, '/images/products/apple/17.jpg', 'Chip A14 Bionic, màn hình 5.4 inch OLED Super Retina XDR, camera 12MP Night Mode, 5G, MagSafe, nhỏ gọn nhất trong dòng iPhone 12'),

('iPhone SE 3 64GB (2022)', 'Apple', 10990000.00, 40, '/images/products/apple/18.jpg', 'Chip A15 Bionic mạnh mẽ, màn hình 4.7 inch Retina HD, Touch ID, camera 12MP, 5G, thiết kế cầm tay thoải mái, giá tốt nhất dòng iPhone'),

('iPhone 11 64GB', 'Apple', 8990000.00, 35, '/images/products/apple/19.jpg', 'Chip A13 Bionic, màn hình 6.1 inch Liquid Retina, camera kép 12MP Night Mode, Face ID, IP68, pin 3110mAh, màu sắc đa dạng'),

('iPhone XR 64GB', 'Apple', 6490000.00, 25, '/images/products/apple/20.jpg', 'Chip A12 Bionic, màn hình 6.1 inch Liquid Retina LCD, camera 12MP, Face ID, IP67, pin 2942mAh, nhiều màu sắc đa dạng, giá cực kỳ hợp lý');

-- ================================================================
--  SAMSUNG – 20 san pham
-- ================================================================
INSERT INTO products (name, brand, price, stock_quantity, image_url, description) VALUES
('Samsung Galaxy S25 Ultra 256GB', 'Samsung', 31990000.00, 35, '/images/products/samsung/21.jpg', 'Chip Snapdragon 8 Elite, bút S-Pen tích hợp, màn hình Dynamic LTPO AMOLED 2X 6.9 inch 120Hz, camera 200MP, Galaxy AI, pin 5000mAh sạc 45W'),

('Samsung Galaxy S25+ 256GB', 'Samsung', 25990000.00, 40, '/images/products/samsung/22.jpg', 'Chip Snapdragon 8 Elite, màn hình Dynamic AMOLED 2X 6.7 inch 120Hz, camera 50MP, Galaxy AI nâng cao, pin 4900mAh sạc nhanh 45W'),

('Samsung Galaxy S25 256GB', 'Samsung', 20990000.00, 55, '/images/products/samsung/23.jpg', 'Chip Snapdragon 8 Elite, màn hình Dynamic AMOLED 2X 6.2 inch 120Hz, camera 50MP, Galaxy AI, pin 4000mAh, sạc nhanh 25W'),

('Samsung Galaxy S24 Ultra 256GB', 'Samsung', 29990000.00, 30, '/images/products/samsung/24.jpg', 'Chip Snapdragon 8 Gen 3, bút S-Pen tích hợp, màn hình 6.8 inch Dynamic LTPO AMOLED 2X 120Hz, camera 200MP, Galaxy AI, pin 5000mAh'),

('Samsung Galaxy S24 FE 128GB', 'Samsung', 13490000.00, 45, '/images/products/samsung/25.jpg', 'Chip Exynos 2500, màn hình Dynamic AMOLED 2X 6.7 inch 120Hz, camera 50MP OIS, Galaxy AI cơ bản, pin 4700mAh sạc nhanh 25W'),

('Samsung Galaxy Z Fold 6 256GB', 'Samsung', 44990000.00, 15, '/images/products/samsung/26.jpg', 'Chip Snapdragon 8 Gen 3, màn hình gập 7.6 inch QXGA+ AMOLED 120Hz, màn hình ngoài 6.3 inch, camera 50MP, bút S-Pen, Galaxy AI'),

('Samsung Galaxy Z Flip 6 256GB', 'Samsung', 22990000.00, 25, '/images/products/samsung/27.jpg', 'Chip Snapdragon 8 Gen 3, màn hình gập 6.7 inch FHD+ AMOLED 120Hz, màn hình ngoài 3.4 inch, camera 50MP, Galaxy AI, pin 4000mAh'),

('Samsung Galaxy A55 256GB', 'Samsung', 10490000.00, 60, '/images/products/samsung/28.jpg', 'Chip Exynos 1480, màn hình Super AMOLED 6.6 inch 120Hz, camera 50MP OIS, pin 5000mAh sạc nhanh 25W, thiết kế khung nhôm IP67'),

('Samsung Galaxy A35 128GB', 'Samsung', 7990000.00, 70, '/images/products/samsung/29.jpg', 'Chip Exynos 1380, màn hình Super AMOLED 6.6 inch 120Hz, camera 50MP OIS, pin 5000mAh, IP67, thiết kế khung nhôm thời trang'),

('Samsung Galaxy A25 128GB', 'Samsung', 5990000.00, 80, '/images/products/samsung/30.jpg', 'Chip Exynos 1280, màn hình Super AMOLED 6.5 inch 120Hz, camera 50MP, pin 5000mAh sạc 25W, bộ nhớ 128GB, tầm trung đáng mua'),

('Samsung Galaxy A16 128GB', 'Samsung', 4990000.00, 85, '/images/products/samsung/31.jpg', 'Chip Exynos 1330, màn hình Super AMOLED 6.7 inch 90Hz, camera 50MP, pin 5000mAh, 5G, bộ nhớ 128GB, thiết kế mỏng nhẹ'),

('Samsung Galaxy M55 128GB', 'Samsung', 8490000.00, 45, '/images/products/samsung/32.jpg', 'Chip Snapdragon 7 Gen 1, màn hình Super AMOLED 6.7 inch 120Hz, camera 50MP OIS, pin 5000mAh sạc siêu nhanh 45W, thiết kế mỏng 7.8mm'),

('Samsung Galaxy S23 FE 128GB', 'Samsung', 11990000.00, 35, '/images/products/samsung/33.jpg', 'Chip Exynos 2200, màn hình Dynamic AMOLED 2X 6.4 inch 120Hz, camera 50MP OIS, pin 4500mAh sạc 25W, thiết kế flagship tầm trung'),

('Samsung Galaxy S23 256GB', 'Samsung', 14990000.00, 30, '/images/products/samsung/34.jpg', 'Chip Snapdragon 8 Gen 2, màn hình Dynamic AMOLED 2X 6.1 inch 120Hz, camera 50MP OIS, pin 3900mAh, thiết kế compact sang trọng'),

('Samsung Galaxy A15 128GB', 'Samsung', 4290000.00, 90, '/images/products/samsung/35.jpg', 'Màn hình Super AMOLED 6.5 inch 90Hz, camera 50MP, pin 5000mAh, 5G, bộ nhớ 128GB, thiết kế mỏng nhẹ, pin trâu'),

('Samsung Galaxy M15 128GB', 'Samsung', 3990000.00, 95, '/images/products/samsung/36.jpg', 'Chip Dimensity 6100+, màn hình Super AMOLED 6.5 inch 90Hz, camera 50MP, pin 6000mAh cực trâu, 5G, bộ nhớ 128GB, giá siêu rẻ'),

('Samsung Galaxy A06 64GB', 'Samsung', 2990000.00, 100, '/images/products/samsung/37.jpg', 'Chip Helio G85, màn hình 6.7 inch HD+ 60Hz, camera 50MP, pin 5000mAh sạc 15W, 4G, thiết kế đơn giản, giá siêu rẻ phù hợp mọi đối tượng'),

('Samsung Galaxy S22 Ultra 256GB', 'Samsung', 19990000.00, 20, '/images/products/samsung/38.jpg', 'Chip Snapdragon 8 Gen 1, bút S-Pen tích hợp, màn hình 6.8 inch Dynamic LTPO AMOLED 2X 120Hz, camera 108MP, pin 5000mAh sạc 45W'),

('Samsung Galaxy Z Fold 5 256GB', 'Samsung', 34990000.00, 18, '/images/products/samsung/39.jpg', 'Chip Snapdragon 8 Gen 2, màn hình gập 7.6 inch AMOLED 120Hz, màn hình ngoài 6.2 inch, camera 50MP OIS, sạc nhanh 25W, pin 4400mAh'),

('Samsung Galaxy Z Flip 5 256GB', 'Samsung', 18990000.00, 22, '/images/products/samsung/40.jpg', 'Chip Snapdragon 8 Gen 2, màn hình gập 6.7 inch AMOLED 120Hz, màn hình ngoài 3.4 inch Flex Window lớn nhất, camera 12MP, sạc nhanh 25W');

-- ================================================================
--  XIAOMI – 20 san pham
-- ================================================================
INSERT INTO products (name, brand, price, stock_quantity, image_url, description) VALUES
('Xiaomi 15 Ultra 512GB', 'Xiaomi', 27990000.00, 20, '/images/products/xiaomi/41.jpg', 'Chip Snapdragon 8 Elite, camera Leica Summilux 50MP zoom 5x, màn hình AMOLED 6.73 inch LTPO 120Hz, sạc HyperCharge 90W, pin 5300mAh, IP68'),

('Xiaomi 15 Pro 256GB', 'Xiaomi', 22990000.00, 25, '/images/products/xiaomi/42.jpg', 'Chip Snapdragon 8 Elite, camera Leica Summilux 50MP, màn hình AMOLED 6.73 inch LTPO 120Hz, sạc nhanh 90W, sạc không dây 50W, pin 5300mAh'),

('Xiaomi 15 256GB', 'Xiaomi', 18990000.00, 35, '/images/products/xiaomi/43.jpg', 'Chip Snapdragon 8 Elite, camera Leica 50MP, màn hình AMOLED 6.36 inch 120Hz, sạc nhanh 90W, pin 5240mAh, thiết kế nhỏ gọn, IP68'),

('Xiaomi 14 Ultra 512GB', 'Xiaomi', 24990000.00, 20, '/images/products/xiaomi/44.jpg', 'Chip Snapdragon 8 Gen 3, camera Leica Summilux 50MP 1-inch, màn hình LTPO AMOLED 6.73 inch 120Hz, sạc HyperCharge 90W, pin 5000mAh'),

('Xiaomi 14 Pro 512GB', 'Xiaomi', 19990000.00, 30, '/images/products/xiaomi/45.jpg', 'Chip Snapdragon 8 Gen 3, camera Leica 50MP, màn hình LTPO AMOLED 6.73 inch 120Hz, sạc nhanh 120W, sạc không dây 50W, pin 4880mAh'),

('Xiaomi 14 256GB', 'Xiaomi', 16990000.00, 40, '/images/products/xiaomi/46.jpg', 'Chip Snapdragon 8 Gen 3, camera Leica 50MP, màn hình AMOLED 6.36 inch 120Hz, sạc nhanh 90W, pin 4610mAh, IP68'),

('Xiaomi POCO F6 Pro 256GB', 'Xiaomi', 13990000.00, 45, '/images/products/xiaomi/47.jpg', 'Chip Snapdragon 8 Gen 2, màn hình AMOLED 6.67 inch LTPO 120Hz, camera 64MP OIS, sạc nhanh 67W, pin 5000mAh, làm lạnh LiquidCool 4.0'),

('Xiaomi POCO F6 256GB', 'Xiaomi', 9990000.00, 50, '/images/products/xiaomi/48.jpg', 'Chip Snapdragon 8s Gen 3, màn hình AMOLED 6.67 inch Flow LTPO 120Hz, camera 50MP OIS, sạc nhanh 90W, pin 5000mAh, gaming phone đích thực'),

('Xiaomi POCO X6 Pro 256GB', 'Xiaomi', 9490000.00, 55, '/images/products/xiaomi/49.jpg', 'Chip Dimensity 8300-Ultra, màn hình AMOLED 6.67 inch Flow LTPO 120Hz, camera 64MP OIS, sạc nhanh 67W, pin 5000mAh, gaming tầm trung'),

('Xiaomi Redmi Note 14 Pro+ 256GB', 'Xiaomi', 9990000.00, 60, '/images/products/xiaomi/50.jpg', 'Chip Dimensity 9200+, màn hình AMOLED 6.67 inch 120Hz, camera 200MP OIS, sạc HyperCharge 120W, pin 5110mAh, IP68'),

('Xiaomi Redmi Note 14 Pro 256GB', 'Xiaomi', 7990000.00, 65, '/images/products/xiaomi/51.jpg', 'Chip Snapdragon 7s Gen 3, màn hình AMOLED 6.67 inch 120Hz, camera 200MP OIS, sạc nhanh 45W, pin 5500mAh, IP68'),

('Xiaomi Redmi Note 14 128GB', 'Xiaomi', 5990000.00, 80, '/images/products/xiaomi/52.jpg', 'Chip Snapdragon 685, màn hình AMOLED 6.67 inch 120Hz, camera 108MP, sạc nhanh 33W, pin 5500mAh, bộ nhớ 128GB'),

('Xiaomi Redmi 14C 128GB', 'Xiaomi', 3990000.00, 90, '/images/products/xiaomi/53.jpg', 'Chip Helio G81-Ultra, màn hình 6.88 inch FHD+ 120Hz, camera 50MP AI, pin 5160mAh sạc 18W, màn hình lớn, pin trâu, giá siêu rẻ'),

('Xiaomi Redmi A4 5G 128GB', 'Xiaomi', 2990000.00, 100, '/images/products/xiaomi/54.jpg', 'Chip Snapdragon 4s Gen 2, màn hình 6.88 inch HD+ 90Hz, camera 50MP, pin 5000mAh, 5G với giá siêu rẻ, phù hợp học sinh sinh viên'),

('Xiaomi 13T Pro 256GB', 'Xiaomi', 17490000.00, 30, '/images/products/xiaomi/55.jpg', 'Chip Dimensity 9200+, camera Leica 50MP OIS, màn hình AMOLED 6.67 inch LTPO 144Hz, sạc HyperCharge 144W nhanh nhất, pin 5000mAh'),

('Xiaomi 13T 256GB', 'Xiaomi', 12990000.00, 40, '/images/products/xiaomi/56.jpg', 'Chip Dimensity 8200 Ultra, camera Leica 50MP OIS, màn hình AMOLED 6.67 inch LTPO 144Hz, sạc nhanh 67W, pin 5000mAh, màu sắc Leica'),

('Xiaomi POCO M6 Pro 256GB', 'Xiaomi', 5490000.00, 70, '/images/products/xiaomi/57.jpg', 'Chip Helio G99-Ultra, màn hình AMOLED 6.67 inch FHD+ 120Hz, camera 64MP OIS, sạc nhanh 67W, pin 5000mAh, bộ nhớ 256GB'),

('Xiaomi Redmi Note 13 Pro+ 256GB', 'Xiaomi', 8990000.00, 55, '/images/products/xiaomi/58.jpg', 'Chip Dimensity 7200 Ultra, màn hình AMOLED 6.67 inch 120Hz, camera 200MP OIS, sạc HyperCharge 120W, pin 5000mAh, IP68'),

('Xiaomi Redmi Note 13 5G 128GB', 'Xiaomi', 4990000.00, 80, '/images/products/xiaomi/59.jpg', 'Chip Snapdragon 685, màn hình AMOLED 6.67 inch 120Hz, camera 108MP, sạc nhanh 33W, pin 5000mAh, 5G, thiết kế mỏng nhẹ'),

('Xiaomi Mix Fold 4 512GB', 'Xiaomi', 38990000.00, 10, '/images/products/xiaomi/60.jpg', 'Chip Snapdragon 8 Gen 3, màn hình gập 8.02 inch LTPO AMOLED 120Hz, màn hình ngoài 6.56 inch, camera Leica 50MP, thiết kế siêu mỏng 9.47mm');

-- ================================================================
--  OPPO – 20 san pham
-- ================================================================
INSERT INTO products (name, brand, price, stock_quantity, image_url, description) VALUES
('OPPO Find X8 Pro 256GB', 'OPPO', 26990000.00, 20, '/images/products/oppo/61.jpg', 'Chip Dimensity 9400, camera Hasselblad 50MP zoom 6x, màn hình AMOLED 6.78 inch LTPO4 120Hz, sạc SUPERVOOC 80W, pin 5910mAh, IP69'),

('OPPO Find X8 256GB', 'OPPO', 21990000.00, 25, '/images/products/oppo/62.jpg', 'Chip Dimensity 9400, camera Hasselblad 50MP, màn hình AMOLED 6.59 inch LTPO 120Hz, sạc SUPERVOOC 80W, sạc không dây 50W, pin 5630mAh'),

('OPPO Find X7 Ultra 256GB', 'OPPO', 23990000.00, 20, '/images/products/oppo/63.jpg', 'Chip Snapdragon 8 Gen 3, camera Hasselblad 50MP kép perisocpe zoom 6x, màn hình AMOLED 6.82 inch LTPO4 120Hz, sạc nhanh 100W, pin 5000mAh'),

('OPPO Find N3 512GB', 'OPPO', 35990000.00, 12, '/images/products/oppo/64.jpg', 'Chip Snapdragon 8 Gen 2, màn hình gập 7.82 inch LTPO AMOLED 120Hz, màn hình ngoài 6.31 inch, camera Hasselblad 48MP, pin 4520mAh sạc 67W'),

('OPPO Find N3 Flip 256GB', 'OPPO', 20990000.00, 15, '/images/products/oppo/65.jpg', 'Chip Dimensity 9200, màn hình gập 6.8 inch AMOLED 120Hz, màn hình ngoài 3.26 inch, camera Hasselblad 50MP, sạc SUPERVOOC 44W, pin 4300mAh'),

('OPPO Reno 12 Pro 256GB', 'OPPO', 12990000.00, 40, '/images/products/oppo/66.jpg', 'Chip Dimensity 9200+, màn hình AMOLED 6.7 inch LTPO 120Hz, camera 50MP OIS AI Portrait, sạc SUPERVOOC 80W, pin 4600mAh, thiết kế mỏng 7.49mm'),

('OPPO Reno 12 256GB', 'OPPO', 10490000.00, 45, '/images/products/oppo/67.jpg', 'Chip Dimensity 8250, màn hình AMOLED 6.7 inch 120Hz, camera 50MP OIS AI Portrait, sạc SUPERVOOC 80W, pin 5000mAh, thiết kế mỏng nhẹ'),

('OPPO Reno 12F 256GB', 'OPPO', 8990000.00, 50, '/images/products/oppo/68.jpg', 'Chip Dimensity 7300, màn hình AMOLED 6.67 inch 120Hz, camera 50MP AI, sạc SUPERVOOC 45W, pin 5000mAh, AI portrait chân dung đẹp'),

('OPPO Reno 11 Pro 256GB', 'OPPO', 11990000.00, 35, '/images/products/oppo/69.jpg', 'Chip Dimensity 8200, màn hình AMOLED 6.7 inch LTPO 120Hz, camera 50MP OIS zoom 3x, sạc SUPERVOOC 80W, pin 4600mAh, thiết kế cong premium'),

('OPPO Reno 11 128GB', 'OPPO', 8490000.00, 55, '/images/products/oppo/70.jpg', 'Chip Dimensity 6080, màn hình AMOLED 6.7 inch 120Hz, camera 64MP, sạc SUPERVOOC 67W, pin 5000mAh, thiết kế mỏng 7.6mm đẹp'),

('OPPO A3 Pro 256GB', 'OPPO', 7490000.00, 60, '/images/products/oppo/71.jpg', 'Chip Dimensity 7050, màn hình AMOLED 6.67 inch 120Hz, camera 64MP, sạc nhanh 45W, pin 5100mAh, IP65, thiết kế thời trang vừa tầm'),

('OPPO A3x 5G 128GB', 'OPPO', 4990000.00, 75, '/images/products/oppo/72.jpg', 'Chip Dimensity 6300, màn hình 6.72 inch HD+ 90Hz, camera 50MP, sạc nhanh 33W, pin 5100mAh, 5G, thiết kế mỏng nhẹ giá siêu rẻ'),

('OPPO A79 5G 128GB', 'OPPO', 6490000.00, 70, '/images/products/oppo/73.jpg', 'Chip Dimensity 6020, màn hình AMOLED 6.72 inch 90Hz, camera 50MP, sạc nhanh SUPERVOOC 33W, pin 5000mAh, 5G, thiết kế mỏng nhẹ'),

('OPPO A58 128GB', 'OPPO', 5490000.00, 80, '/images/products/oppo/74.jpg', 'Chip Helio G85, màn hình LCD 6.72 inch 90Hz, camera 64MP, sạc SUPERVOOC 33W, pin 5000mAh, bộ nhớ 128GB, thiết kế đẹp giá phải chăng'),

('OPPO A38 128GB', 'OPPO', 4490000.00, 85, '/images/products/oppo/75.jpg', 'Chip Helio G85, màn hình 6.56 inch 90Hz, camera 50MP, sạc SUPERVOOC 33W, pin 5000mAh, RAM 4GB, thiết kế đơn giản bền đẹp'),

('OPPO A18 64GB', 'OPPO', 2990000.00, 100, '/images/products/oppo/76.jpg', 'Chip Helio G85, màn hình 6.56 inch 60Hz, camera 8MP, pin 5000mAh sạc 10W, giá siêu rẻ phù hợp các nhu cầu cơ bản'),

('OPPO Reno 10 Pro+ 256GB', 'OPPO', 15990000.00, 25, '/images/products/oppo/77.jpg', 'Chip Snapdragon 8+ Gen 1, camera perisocpe 64MP zoom 6x, màn hình AMOLED 6.74 inch 120Hz, sạc SUPERVOOC 100W, pin 4700mAh'),

('OPPO Reno 10 Pro 256GB', 'OPPO', 12490000.00, 30, '/images/products/oppo/78.jpg', 'Chip Dimensity 8200, camera 64MP OIS zoom 2x, màn hình AMOLED 6.7 inch 120Hz, sạc SUPERVOOC 80W, pin 4600mAh, thiết kế premium'),

('OPPO A96 128GB', 'OPPO', 6990000.00, 55, '/images/products/oppo/79.jpg', 'Chip Snapdragon 680, màn hình AMOLED 6.59 inch 90Hz, camera 50MP AI, sạc SUPERVOOC 33W, pin 5000mAh, thiết kế mỏng 7.49mm'),

('OPPO Find X5 Pro 256GB', 'OPPO', 19990000.00, 20, '/images/products/oppo/80.jpg', 'Chip Snapdragon 8 Gen 1, camera Hasselblad 50MP OIS, màn hình AMOLED 6.7 inch LTPO 120Hz, sạc SUPERVOOC 80W, sạc không dây 50W, IP55');

-- ================================================================
--  VIVO – 20 san pham
-- ================================================================
INSERT INTO products (name, brand, price, stock_quantity, image_url, description) VALUES
('vivo X200 Ultra 512GB', 'vivo', 32990000.00, 15, '/images/products/vivo/81.jpg', 'Chip Snapdragon 8 Elite, camera ZEISS 200MP 1-inch zoom perisocpe, màn hình AMOLED 6.82 inch LTPO4 120Hz, sạc nhanh 100W, pin 6000mAh, IP69'),

('vivo X200 Pro 256GB', 'vivo', 24990000.00, 20, '/images/products/vivo/82.jpg', 'Chip Dimensity 9400, camera ZEISS 50MP 1-inch zoom 100x, màn hình AMOLED 6.78 inch LTPO 120Hz, sạc nhanh 90W, sạc không dây 30W, pin 5800mAh'),

('vivo X200 256GB', 'vivo', 19990000.00, 30, '/images/products/vivo/83.jpg', 'Chip Dimensity 9400, camera ZEISS 50MP, màn hình AMOLED 6.67 inch LTPO 120Hz, sạc nhanh 90W, sạc không dây 30W, pin 5800mAh, IP68'),

('vivo X100 Ultra 512GB', 'vivo', 27990000.00, 15, '/images/products/vivo/84.jpg', 'Chip Snapdragon 8 Gen 3, camera ZEISS 50MP 1-inch zoom 200x, màn hình AMOLED 6.78 inch LTPO4 120Hz, sạc nhanh 100W, pin 5500mAh'),

('vivo X100 Pro 256GB', 'vivo', 22990000.00, 20, '/images/products/vivo/85.jpg', 'Chip Dimensity 9300, camera ZEISS 50MP 1-inch, màn hình AMOLED 6.78 inch LTPO4 120Hz, sạc nhanh 100W, sạc không dây 50W, pin 5400mAh, IP68'),

('vivo X100 256GB', 'vivo', 17990000.00, 35, '/images/products/vivo/86.jpg', 'Chip Dimensity 9300, camera ZEISS 50MP, màn hình AMOLED 6.78 inch 120Hz, sạc nhanh 120W, sạc không dây 50W, pin 5000mAh'),

('vivo V40 Pro 256GB', 'vivo', 12990000.00, 40, '/images/products/vivo/87.jpg', 'Chip Snapdragon 7 Gen 3, camera ZEISS 50MP OIS, màn hình AMOLED 6.78 inch LTPO 120Hz, sạc nhanh 80W, sạc không dây 30W, pin 5500mAh, IP68'),

('vivo V40 256GB', 'vivo', 10490000.00, 45, '/images/products/vivo/88.jpg', 'Chip Snapdragon 7 Gen 3, camera ZEISS 50MP, màn hình AMOLED 6.78 inch 120Hz, sạc nhanh 80W, pin 5500mAh, thiết kế mỏng 7.58mm đẹp'),

('vivo V40 Lite 256GB', 'vivo', 8490000.00, 55, '/images/products/vivo/89.jpg', 'Chip Snapdragon 6 Gen 1, camera ZEISS 50MP, màn hình AMOLED 6.78 inch 120Hz, sạc nhanh 80W, pin 5000mAh, thiết kế mỏng 7.59mm'),

('vivo Y200 Pro 256GB', 'vivo', 7990000.00, 60, '/images/products/vivo/90.jpg', 'Chip Snapdragon 4 Gen 2, màn hình AMOLED 6.67 inch 120Hz, camera 64MP OIS, sạc nhanh 80W, pin 5000mAh, thiết kế mỏng 7.79mm, 5G'),

('vivo Y200t 128GB', 'vivo', 6990000.00, 65, '/images/products/vivo/91.jpg', 'Chip Dimensity 7025, màn hình AMOLED 6.67 inch 120Hz, camera 50MP, sạc nhanh 44W, pin 5000mAh, 5G, thiết kế thời trang giá tốt'),

('vivo Y100 128GB', 'vivo', 6490000.00, 70, '/images/products/vivo/92.jpg', 'Chip Snapdragon 4 Gen 1, màn hình AMOLED 6.38 inch 90Hz, camera 64MP, sạc nhanh 44W, pin 4500mAh, thiết kế mỏng nhẹ cầm tay đẹp'),

('vivo Y58 5G 128GB', 'vivo', 5490000.00, 80, '/images/products/vivo/93.jpg', 'Chip Dimensity 6300, màn hình 6.67 inch 90Hz, camera 50MP, sạc nhanh 44W, pin 5000mAh, 5G, bộ nhớ 128GB, RAM 8GB'),

('vivo Y36 5G 128GB', 'vivo', 4990000.00, 85, '/images/products/vivo/94.jpg', 'Chip Snapdragon 680, màn hình 6.64 inch 90Hz, camera 50MP, sạc nhanh 44W, pin 5000mAh, 4G, thiết kế gradient đẹp mắt'),

('vivo Y28 5G 128GB', 'vivo', 3990000.00, 90, '/images/products/vivo/95.jpg', 'Chip Dimensity 6020, màn hình 6.56 inch 90Hz, camera 50MP, sạc nhanh 15W, pin 6000mAh siêu trâu, 5G, phù hợp dùng cả ngày'),

('vivo Y17s 128GB', 'vivo', 3590000.00, 95, '/images/products/vivo/96.jpg', 'Chip Helio G85, màn hình 6.56 inch 90Hz, camera 50MP, pin 5000mAh sạc 15W, 4G, thiết kế bền đẹp, giá cực kỳ phải chăng'),

('vivo Y03 64GB', 'vivo', 2790000.00, 100, '/images/products/vivo/97.jpg', 'Chip Helio G85, màn hình 6.56 inch 60Hz, camera 8MP, pin 5000mAh, thiết kế gọn nhẹ, giá siêu rẻ, phù hợp nhu cầu cơ bản'),

('vivo iQOO 13 256GB', 'vivo', 21990000.00, 20, '/images/products/vivo/98.jpg', 'Chip Snapdragon 8 Elite, màn hình AMOLED 6.82 inch LTPO4 144Hz, camera 50MP OIS ZEISS, sạc nhanh 120W, pin 6000mAh, gaming flagship'),

('vivo iQOO 12 256GB', 'vivo', 18490000.00, 25, '/images/products/vivo/99.jpg', 'Chip Snapdragon 8 Gen 3, màn hình AMOLED 6.78 inch LTPO4 144Hz, camera 50MP OIS ZEISS, sạc nhanh 120W, pin 5000mAh, gaming phone đỉnh cao'),

('vivo iQOO Z9 Turbo 256GB', 'vivo', 11990000.00, 35, '/images/products/vivo/100.jpg', 'Chip Snapdragon 8s Gen 3, màn hình AMOLED 6.78 inch 144Hz, camera 50MP OIS, sạc nhanh 80W, pin 5500mAh, gaming phone tầm trung đỉnh nhất');


