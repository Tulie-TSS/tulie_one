# N8N Content Automation - Setup Guide

## 🚀 Quick Start

### 1. Import Workflows

Trong n8n, vào **Settings → Import Workflow** và import lần lượt:

1. `01-content-generation.json` — Main pipeline
2. `02-approval-handler.json` — Approval handler  
3. `03-scheduled-publisher.json` — Scheduled publisher

### 2. Tạo Google Sheet

Tạo sheet tên `ContentPlan` với các cột:

```
post_id | date_planned | time_planned | channel | topic | keywords | core_message | image_template | background_url | person_image_url | headline_text | sub_text | cta_text | tone | status | generated_image_url | generated_caption_fb | generated_article_wp | approval_note | published_url
```

**Status values:** `pending` → `creating` → `review` → `approved` → `published`

### 3. Environment Variables (n8n)

Vào **Settings → Variables** trong n8n, thêm:

| Variable | Giá trị |
|----------|---------|
| `GOOGLE_SHEET_ID` | ID của Google Sheet |
| `BRAND_NAME` | Tên thương hiệu |
| `LOGO_URL` | URL logo (PNG, nền trong suốt) |
| `FB_PAGE_ID` | Facebook Page ID |
| `FB_PAGE_TOKEN` | Long-lived Page Access Token |
| `WP_URL` | WordPress URL (vd: `https://blog.example.com`) |
| `SLACK_REVIEW_CHANNEL` | Slack channel ID cho review |

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
curl "https://graph.facebook.com/v19.0/oauth/access_token?\
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

## 📋 Test Checklist

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
