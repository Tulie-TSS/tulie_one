const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    await client.connect();
    console.log('Connected to Database. Fetching current brand_config...');

    const res = await client.query(`SELECT value FROM public.system_settings WHERE key = 'brand_config'`);
    const currentConfig = res.rows[0]?.value || {};

    const newNotes = 
`1. Hiệu lực báo giá: Trong vòng 30 ngày kể từ ngày ban hành văn bản này.
2. Hạ tầng & Vận hành:
   - Khách hàng chịu trách nhiệm cung cấp, duy trì và chi trả chi phí cho Tên miền (Domain), Máy chủ (Hosting/VPS) và các dịch vụ bên thứ ba (nếu có). Agency hỗ trợ trỏ tên miền và cấu hình môi trường.
   - Hệ thống CMS và hạ tầng lưu trữ: Sử dụng các gói miễn phí (Free Tier) của nhà cung cấp ở giai đoạn đầu. Quý khách tự chi trả chi phí nếu lưu lượng/dung lượng lưu trữ vượt quá giới hạn miễn phí (ví dụ: > 500MB media hosting) hoặc khi cần nâng cấp tính năng CMS nâng cao.
3. Phạm vi công việc & Giới hạn:
   - Báo giá thiết kế & lập trình demo trực tiếp trên trình duyệt tối đa 15 trang chính, hỗ trợ tối đa 03 vòng chỉnh sửa cho mỗi trang.
   - Nhập liệu ban đầu giới hạn tối đa: 5 sản phẩm, 6 bài viết, 6 đối tác, 3 vị trí tuyển dụng.
   - Không bao gồm dịch thuật nội dung song ngữ, thiết kế bộ nhận diện thương hiệu, tích hợp ERP/CRM/Cổng thanh toán online (trừ khi được nêu rõ trong bảng hạng mục chi tiết).
4. Điều kiện tiên quyết: Khách hàng cung cấp đầy đủ thông tin, tài liệu và chỉ định một đầu mối liên lạc duy nhất để duyệt yêu cầu. Mọi yêu cầu thay đổi ngoài phạm vi sẽ áp dụng phí phát sinh (Change Request).`;

    const newTerms =
`- Đợt 1: 50% tổng giá trị dịch vụ ngay sau khi xác nhận báo giá / ký kết hợp đồng.
- Đợt 2: 50% còn lại trong vòng 05 ngày làm việc sau khi nghiệm thu và bàn giao website (hoặc đưa vào sử dụng chính thức).`;

    const updatedConfig = {
        ...currentConfig,
        default_notes: newNotes,
        default_payment_terms: newTerms
    };

    console.log('Updating brand_config with legally balanced defaults...');
    await client.query(`
        INSERT INTO public.system_settings (key, value, updated_at)
        VALUES ('brand_config', $1, NOW())
        ON CONFLICT (key) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW();
    `, [updatedConfig]);

    console.log('brand_config updated successfully!');
    await client.end();
}

run().catch(console.error);
