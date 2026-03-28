---
description: Chiến lược Tên miền & Quy trình Git Monorepo
---
# 🌐 Chiến lược hạ tầng & tên miền (Infrastructure Strategy)

Tài liệu này hướng dẫn chiến lược sử dụng tên miền và quy trình làm việc với Git trong hệ thống **Monorepo (tulie_one)**. Mọi lập trình viên và AI Agent khi làm việc với dự án cần tuân thủ cấu trúc này để đảm bảo tính đồng bộ, bảo mật và khả năng mở rộng.

## Bản đồ Tên miền (Domain Mapping)

Hệ sinh thái ứng dụng của Tulie sử dụng chiến lược tách biệt giữa cổng thông tin truyền thông và các ứng dụng SaaS.

| Ứng dụng | Đường dẫn (Monorepo) | Tên miền chính thức | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Corporate Website** | N/A (Web riêng) | `www.tulie.vn` | Kênh truyền thông doanh nghiệp, SEO, Blog nội địa |
| **Agency Portfolio** | N/A (Web riêng) | `tulie.agency` | Giới thiệu dự án mẫu, chiến dịch dịch vụ B2B, landing page |
| **Core API/Backend** | N/A (Server riêng/ DB) | `api.tulie.io.vn` | Hệ thống xử lý logic ngầm, Database kết nối đa ứng dụng |
| **Tulie CRM** | `apps/tulie_crm` | `crm.tulie.app` | Quản lý quan hệ khách hàng (SaaS) |
| **Tulie ERP** | `apps/tulie_erp` | `erp.tulie.app` | Quản trị nguồn lực doanh nghiệp (SaaS) |
| **Tulie Workforce** | `apps/tulie_workforce` | `workforce.tulie.app` | Quản lý nhân sự, làm việc từ xa (SaaS) |
| **Tulie Workspace** | `apps/tulie_workspace` | `workspace.tulie.app` | Không gian làm việc, tài liệu dùng chung (SaaS) |
| **SSO / ID Lock** | `apps/tulie_id` *(Tương lai)*| `id.tulie.app` | Cổng đăng nhập tập trung xuyên suốt hệ sinh thái ứng dụng |

## Quy trình làm việc với Git (Git Workflow)

Do `tulie_one` là một monorepo, mọi ứng dụng (CRM, ERP, Workforce...) đều nằm chung một kho lưu trữ (repository). Khi thay đổi code, chúng ta **không tách riêng Git repo cho từng App**.

### Quy tắc phân nhánh (Branching & Scoping)
1. **Nhánh `main` (hoặc `master`)**: Chứa mã nguồn ổn định nhất để triển khai (Deploy) diện rộng lên môi trường Production (Chạy thật trên các tên miền `.app`).
2. **Quản lý tính năng mới qua nhánh (Feature Branch)**: Khi code tính năng cho một app cụ thể, tạo nhánh mới với tiền tố là tên app để giữ sạch lịch sử thay đổi:
   - `feat/crm-dashboard`: Phát triển tính năng dashboard cho CRM.
   - `fix/ui-button`: Sửa một component Button trong `packages/ui` dùng chung.
   - `feat/erp-inventory`: Thay đổi module kho vận của ERP.

### Quy trình Commit và Push (Monorepo Push)
- Khi hoàn thành tính năng trên nhánh `feat/crm-dashboard` hoặc thực hiện xong công việc, lệnh `git push` sẽ gửi **toàn bộ folder tulie_one** lên Git repository một lần.
- Không có chuyện "push riêng thư mục `tulie_crm`". Code nằm chung chung nhưng hệ thống triển khai lại rất thông minh để giải quyết vấn đề đó.

### ⚡ Tại sao ứng dụng dở dang không làm sập ứng dụng hoàn thiện?
- Hệ thống CI/CD như Vercel/Netlify có cơ chế **Turbo Repo Build Cache**.
- Khi bạn push code lên `main`, hệ thống sẽ tự quét lại toàn bộ cây thư mục xem những file nào vừa thay đổi mã nguồn.
- Nếu bạn chỉ sửa code trong `apps/tulie_crm`, Vercel sẽ nhận diện và **chỉ BẮT KÈM thư mục `tulie_crm` đem đi build** gửi cho người dùng cuối. Nó bỏ qua mọi thay đổi nháp ở `apps/tulie_erp` hay `apps/tulie_workforce`. 

## Hướng dẫn thiết lập Deploy trên Vercel / Cloudflare:
Trong giao diện Vercel, ứng dụng Monorepo được cấu hình để mỗi App trở thành một Website tách biệt theo Domain:
1. Chọn **Add New Project**. Chỉ định nguyên kho Git lưu trữ **`tulie_one`**.
2. Tại phần **Root Directory**, ấn Edit và chọn đúng App cần thiết lập (VD: `apps/tulie_crm`).
3. Vercel tự động config Turborepo và Next.js.
4. Chọn Deploy. Đợi vài phút sau đó chuyển qua **Settings -> Domains**.
5. Cập nhật `crm.tulie.app` tương ứng. Lúc này Website đó hoạt động 100% độc lập, bạn làm việc xong app khác và push code sau thì Vercel sẽ tự xử lý cho app mới đó mà không ảnh hưởng tới CRM.
