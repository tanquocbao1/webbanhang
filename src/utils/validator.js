// ============================================================
//  src/utils/validator.js
//  Lớp kiểm duyệt (Validation) & Làm sạch dữ liệu (Sanitization)
//  cho toàn bộ hệ thống API Client -> Admin
// ============================================================

/**
 * Làm sạch chuỗi văn bản:
 * - Loại bỏ khoảng trắng thừa ở 2 đầu và giữa các từ
 * - Loại bỏ các thẻ HTML / Javascript độc hại (Chống Stored XSS)
 */
export const sanitizeString = (val, maxLen = 255) => {
    if (typeof val !== 'string') return '';
    // 1. Loại bỏ các thẻ HTML / Script
    let clean = val.replace(/<[^>]*>/g, '');
    // 2. Chuyển đổi các ký tự đặc biệt nguy hiểm sang HTML entities an toàn
    clean = clean
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // 3. Chuẩn hóa khoảng trắng
    clean = clean.replace(/\s+/g, ' ').trim();
    // 4. Giới hạn độ dài tối đa
    return clean.slice(0, maxLen);
};

/**
 * Kiểm tra định dạng Email chuẩn (RFC 5322 simplified)
 */
export const isValidEmail = (email) => {
    if (typeof email !== 'string') return false;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
};

/**
 * Kiểm tra số điện thoại di động Việt Nam:
 * - Đầu số: 03, 05, 07, 08, 09 (hoặc +843, +845, +847, +848, +849)
 * - Đúng 10 chữ số (hoặc 11 ký tự nếu bắt đầu bằng +84)
 */
export const isValidVNPhone = (phone) => {
    if (typeof phone !== 'string') return false;
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const regex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    return regex.test(cleanPhone);
};

/**
 * Chuẩn hóa số điện thoại về định dạng chuẩn 10 chữ số (bắt đầu bằng 0)
 */
export const normalizePhone = (phone) => {
    if (typeof phone !== 'string') return '';
    let clean = phone.replace(/[\s.-]/g, '');
    if (clean.startsWith('+84')) {
        clean = '0' + clean.slice(3);
    }
    return clean;
};

/**
 * Kiểm tra định dạng Căn cước công dân (CCCD) Việt Nam:
 * - CCCD gắn chip hiện hành: đúng 12 chữ số
 * - CMND cũ: đúng 9 chữ số
 */
export const isValidIdCard = (idCard) => {
    if (!idCard) return true; // Cho phép rỗng nếu phương thức là thẻ tín dụng
    if (typeof idCard !== 'string') return false;
    const clean = idCard.replace(/\s/g, '');
    return /^[0-9]{9}$|^[0-9]{12}$/.test(clean);
};

/**
 * Kiểm tra họ và tên hợp lệ (chữ cái tiếng Việt, tối thiểu 2 từ)
 */
export const isValidFullName = (name) => {
    if (typeof name !== 'string') return false;
    const clean = name.trim();
    if (clean.length < 3 || clean.length > 100) return false;
    // Tối thiểu 2 từ cách nhau bởi khoảng trắng
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length < 2) return false;
    // Không chứa chữ số hoặc ký tự đặc biệt nguy hiểm
    const regex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/;
    return regex.test(clean);
};
