# N8N Content Automation - Setup Guide

## 🚀 Quick Start

### 1. Import Workflows

Trong n8n, vào **Settings → Import Workflow** và import lần lượt:

**Content Pipeline (Google Sheets + Slack + Bannerbear):**
1. `01-content-generation.json` — Main pipeline
2. `02-approval-handler.json` — Approval handler  
3. `03-scheduled-publisher.json` — Scheduled publisher

**Facebook Automation (Supabase-backed):**
4. `01-content-creator.json` — AI content creator → Supabase
5. `02-image-generator.json` — Auto image generation
6. `03-auto-poster.json` — Auto publish to FB Page
7. `04-fb-ads-manager.json` — Campaign + Insights sync

**All-in-One:**
8. `content-automation-all-in-one.json` — Full pipeline (Sheet → AI → Bannerbear → Slack → FB/WP)

### 2. Environment Variables

Tất cả biến cần được set trong **Docker Compose** (đã cấu hình sẵn) hoặc **n8n Settings → Variables**.

#### Core Variables (bắt buộc cho FB workflows)

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `WORKFORCE_URL` | URL của Workforce app | `http://tulie_workforce:8080` (Docker) hoặc `https://workforce.tulie.app` |
| `N8N_WEBHOOK_SECRET` | Secret key xác thực API | `your_super_secret` |
| `FB_PAGE_ID` | Facebook Page ID | `123456789` |
| `FB_ACCESS_TOKEN` | Long-lived Page Access Token | `EAAx...` |
| `FB_AD_ACCOUNT_ID` | FB Ad Account ID (có prefix `act_`) | `act_123456789` |

#### Content Pipeline Variables (cho All-in-One / Google Sheet workflows)

| Variable | Mô tả |
|----------|-------|
| `GOOGLE_SHEET_ID` | ID của Google Sheet ContentPlan |
| `BRAND_NAME` | Tên thương hiệu (mặc định: `Tulie`) |
| `LOGO_URL` | URL logo (PNG, nền trong suốt) |
| `WP_URL` | WordPress URL (vd: `https://blog.example.com`) |
| `SLACK_REVIEW_CHANNEL` | Slack channel ID cho review |

### 3. Google Sheet Setup (cho Content Pipeline)

Tạo sheet tên `ContentPlan` với các cột:

```
post_id | date_planned | time_planned | channel | topic | keywords | core_message | image_template | background_url | person_image_url | headline_text | sub_text | cta_text | tone | status | generated_image_url | generated_caption_fb | generated_article_wp | approval_note | published_url
```

**Status values:** `pending` → `creating` → `review` → `approved` → `published`

### 4. Credentials cần tạo trong n8n

| Credential | Type | Hướng dẫn |
|-----------|------|-----------| 
| Google Sheets | OAuth2 | Google Cloud Console → Enable Sheets API → Create OAuth2 |
| OpenAI | API Key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Bannerbear | HTTP Header Auth | Header: `Authorization`, Value: `Bearer YOUR_KEY` |
| Slack Bot | Bot Token | Slack App → OAuth → Bot User OAuth Token (`xoxb-...`) |
| WordPress | HTTP Basic Auth | WP Admin → Users → Application Passwords |

### 5. Slack App Setup

1. Vào [api.slack.com/apps](https://api.slack.com/apps) → Create New App
2. **Interactivity**: Enable → Request URL = `https://your-n8n.com/webhook/content-approval`
3. **Bot Token Scopes**: `chat:write`, `chat:write.public`, `files:write`
4. Install to workspace

### 6. Facebook Page Token

```bash
# 1. Lấy short-lived token từ Graph API Explorer
# 2. Đổi sang long-lived token:
curl "https://graph.facebook.com/v21.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=APP_ID&\
client_secret=APP_SECRET&\
fb_exchange_token=SHORT_LIVED_TOKEN"
```

### 7. Bannerbear Templates

1. Tạo account tại [bannerbear.com](https://www.bannerbear.com)
2. Tạo templates với các layers: `background`, `person`, `logo`, `headline`, `subtext`, `cta`
3. Copy template UID vào cột `image_template` trong Google Sheet

---

## 🔌 API Endpoints (Workforce ↔ N8N)

Các endpoints trong Workforce mà n8n workflows gọi đến:

| Method | Endpoint | Workflow | Mô tả |
|--------|----------|----------|-------|
| `GET` | `/api/n8n` | All | Health check |
| `GET` | `/api/n8n/content?status=approved` | 03-auto-poster | Lấy bài đã duyệt |
| `POST` | `/api/n8n/content` | 01-content-creator | Tạo bài mới |
| `PATCH` | `/api/n8n/content` | 03-auto-poster | Cập nhật status (published) |
| `POST` | `/api/n8n/fb-sync` | 04-fb-ads-manager | Sync campaign metrics |
| `POST` | `/api/n8n/fb-alert` | 04-fb-ads-manager | Tạo alert từ AI analysis |
| `GET` | `/api/n8n/templates` | 01-content-creator | Lấy content templates |

Tất cả endpoints yêu cầu header: `Authorization: Bearer <N8N_WEBHOOK_SECRET>`

---

## 📋 Test Checklist

### Facebook Auto Poster (03)
- [ ] Set `FB_PAGE_ID` + `FB_ACCESS_TOKEN` trong env
- [ ] Tạo 1 content post với `status = approved` + `image_url` trong Supabase
- [ ] Chạy manual workflow → verify bài đăng lên Facebook
- [ ] Kiểm tra Supabase: status = `published`, `fb_post_id` != null

### FB Ads Manager (04)
- [ ] Set `FB_AD_ACCOUNT_ID` + `FB_ACCESS_TOKEN` trong env
- [ ] Chạy manual "Check performance" trigger → verify insights sync
- [ ] Kiểm tra Supabase table `fb_campaigns` có data
- [ ] Test auto-alert: tạo campaign giả với CPR > 50K

### Content Pipeline (All-in-One)
- [ ] Thêm 1 row vào Sheet với `status = pending`
- [ ] Chạy manual Workflow 1 → kiểm tra ảnh + caption + article được tạo
- [ ] Click Approve trên Slack → kiểm tra Sheet cập nhật `approved`
- [ ] Đặt `date_planned` + `time_planned` = now → kiểm tra bài được publish
- [ ] Verify bài trên Facebook Page + WordPress

## ⚠️ Lưu ý

- **Facebook token** hết hạn sau 60 ngày → cần auto-refresh hoặc renew manual
- **Bannerbear** có limit API calls theo plan → check usage
- **Rate limit**: Facebook cho max ~50 posts/hour — spacing tự động nếu nhiều bài
- **Error handling**: Thêm Error Trigger node vào mỗi workflow để bắt lỗi → notify Slack
- **`N8N_ENV_VARS_IN_ALLOWED_EXPRESSIONS`**: Đã được cấu hình trong `docker-compose.yml` để cho phép n8n truy cập các biến môi trường trong expressions (`$env.FB_PAGE_ID`, etc.)
