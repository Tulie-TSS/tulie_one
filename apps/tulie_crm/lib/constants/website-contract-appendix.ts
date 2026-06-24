export interface AppendixSection {
    key: string
    label: string
    content: string
}

/** Default commercial/legal appendix for website-development quotations. */
export const DEFAULT_WEBSITE_CONTRACT_APPENDIX: AppendixSection[] = [
    {
        key: 'scope_of_work',
        label: 'Phạm vi công việc và nguyên tắc phạm vi',
        content: `Bên B cung cấp dịch vụ thiết kế và phát triển website theo các hạng mục thể hiện tại Bảng giá, bao gồm thiết kế giao diện, lập trình, cấu hình CMS, tích hợp các chức năng đã chốt, kiểm thử và bàn giao.

Mọi tính năng, trang, biểu mẫu, tích hợp, loại nội dung hoặc công việc không được mô tả rõ tại Báo giá/Phụ lục này được hiểu là ngoài phạm vi và chỉ thực hiện sau khi hai bên thống nhất bằng văn bản hoặc email về chi phí và thời gian bổ sung.`
    },
    {
        key: 'technical_requirements',
        label: 'Yêu cầu kỹ thuật và chức năng mặc định',
        content: `Website hiển thị tương thích trên Desktop, Tablet và Mobile; hỗ trợ các phiên bản mới nhất của Chrome, Cốc Cốc, Edge, Firefox và Safari tại thời điểm nghiệm thu.

Phạm vi kỹ thuật mặc định gồm: CMS quản trị các loại nội dung đã chốt; biểu mẫu thu thập thông tin theo Bảng giá; cấu hình SEO kỹ thuật cơ bản (sitemap.xml, robots.txt, canonical URL, semantic HTML, metadata); bảo mật cơ bản và môi trường triển khai phù hợp.

Các yêu cầu về thương mại điện tử, thanh toán trực tuyến, CRM/marketing automation, phân quyền phức tạp, workflow nhiều bước, tích hợp bên thứ ba hoặc ngôn ngữ bổ sung chỉ được thực hiện khi được liệt kê cụ thể trong Bảng giá.`
    },
    {
        key: 'deliverables',
        label: 'Sản phẩm bàn giao và tiêu chí nghiệm thu',
        content: `Sản phẩm bàn giao gồm website vận hành trên môi trường đã thống nhất, mã nguồn và/hoặc quyền truy cập theo thỏa thuận, tài khoản quản trị CMS, tài liệu/hướng dẫn sử dụng cơ bản và các hạng mục khác ghi tại Bảng giá.

Nghiệm thu dựa trên việc website và từng hạng mục vận hành đúng phạm vi đã chốt, hiển thị đáp ứng trên các nhóm thiết bị, không có lỗi nghiêm trọng ngăn cản sử dụng và đáp ứng tiêu chí riêng nêu tại từng hạng mục. Bên A xác nhận qua biên bản hoặc email; nếu không phản hồi trong thời hạn hai bên thỏa thuận sau khi Bên B gửi bản nghiệm thu hợp lệ, hạng mục được xem là đã được chấp nhận trong phạm vi pháp luật cho phép.`
    },
    {
        key: 'revision_rules',
        label: 'Chỉnh sửa giao diện và nhập liệu ban đầu',
        content: `Một vòng chỉnh sửa là một tập hợp yêu cầu được Bên A gửi qua một email hoặc một tài liệu tổng hợp. Số vòng chỉnh sửa và số lượng nội dung Bên B hỗ trợ nhập ban đầu áp dụng đúng theo Bảng giá.

Yêu cầu gửi rời rạc, thay đổi concept sau khi đã chốt, thêm trang/template, form hoặc logic xử lý mới; hoặc thay đổi cấu trúc dữ liệu được coi là phát sinh ngoài phạm vi. Nội dung còn lại do Bên A tự quản trị trên CMS sau khi được hướng dẫn.`
    },
    {
        key: 'timeline',
        label: 'Lộ trình triển khai và mốc thực hiện',
        content: `Tổng thời gian thực hiện dự kiến và ngày kết thúc dự kiến được ghi tại Báo giá/Hợp đồng. Các mốc gồm: chốt giao diện; phát triển giao diện; phát triển chức năng, CMS và tích hợp; kiểm thử, nhập liệu, đào tạo và go-live.

Việc Bên A xác nhận từng mốc bằng biên bản hoặc email là căn cứ để Bên B chuyển sang giai đoạn tiếp theo và xác định phạm vi đã chốt. Tiến độ được điều chỉnh tương ứng nếu Bên A chậm cung cấp nội dung, dữ liệu, phản hồi, phê duyệt, quyền truy cập hoặc thanh toán.`
    },
    {
        key: 'change_control',
        label: 'Quy định về phát sinh và thay đổi',
        content: `Yêu cầu phát sinh phải được Bên A gửi bằng văn bản/email. Bên B sẽ đánh giá tác động, báo giá và thời gian thực hiện; Bên B chỉ có nghĩa vụ triển khai sau khi hai bên chấp thuận bằng văn bản/email hoặc ký phụ lục bổ sung.

Phần phát sinh có thể làm thay đổi tổng giá trị, thời gian thực hiện, ngày kết thúc dự kiến và các mốc thanh toán.`
    },
    {
        key: 'customer_responsibilities',
        label: 'Trách nhiệm phối hợp của Bên A',
        content: `Bên A cung cấp kịp thời và chịu trách nhiệm về tính chính xác, hợp pháp của nội dung, hình ảnh, tài liệu, logo, dữ liệu và các quyền cần thiết để Bên B triển khai. Bên A chịu trách nhiệm đối với nội dung dịch thuật và dữ liệu cá nhân do mình cung cấp; đồng thời bảo đảm tuân thủ pháp luật liên quan.

Việc Bên A chậm cung cấp hoặc phê duyệt thông tin không được xem là lỗi chậm tiến độ của Bên B.`
    },
    {
        key: 'warranty',
        label: 'Bảo hành và hỗ trợ kỹ thuật',
        content: `Bên B bảo hành các lỗi kỹ thuật phát sinh từ hệ thống do Bên B phát triển trong thời hạn ghi tại Báo giá/Hợp đồng. Bảo hành không bao gồm tính năng mới, thay đổi giao diện/nội dung, lỗi do Bên A hoặc bên thứ ba can thiệp, hoặc lỗi thuộc hạ tầng/dịch vụ do Bên A tự quản lý.

Sau thời hạn bảo hành, các yêu cầu hỗ trợ hoặc bảo trì được báo giá và thực hiện theo thỏa thuận riêng.`
    },
]

export function getDefaultWebsiteContractAppendix(): AppendixSection[] {
    return DEFAULT_WEBSITE_CONTRACT_APPENDIX.map(section => ({ ...section }))
}
