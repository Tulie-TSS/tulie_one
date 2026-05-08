# API SPECIFICATION — Tulie Workspace

**Phiên bản:** 1.0  
**Ngày:** 2026-03-19  
**Base URL:** `https://app.tulie-workspace.app/api/v1`  
**Auth:** Bearer Token (JWT) hoặc API Key  
**Tham chiếu:** [PRD.md](../PRD.md) §11

---

## 1. Tổng quan

### 1.1 Conventions

| Quy tắc | Mô tả |
|----------|--------|
| **Versioning** | URL-based: `/api/v1/...` |
| **Format** | JSON (request & response) |
| **Date/Time** | ISO 8601 UTC: `2026-03-19T12:00:00Z` |
| **Pagination** | Cursor-based: `?cursor=xxx&limit=20` |
| **Errors** | Consistent error envelope (xem §7) |
| **Naming** | snake_case cho JSON fields |
| **HTTP Methods** | GET (read), POST (create), PATCH (partial update), DELETE |

### 1.2 Authentication

Mọi request cần 1 trong các header sau:

```
Authorization: Bearer <jwt_access_token>
```

hoặc (cho server-to-server):

```
X-API-Key: <api_key>
```

### 1.3 Rate Limiting

| Endpoint group | Limit | Burst | Header |
|---------------|-------|-------|--------|
| Read (GET) | 1000 req/min | 50 req/s | `X-RateLimit-Remaining` |
| Write (POST/PATCH/DELETE) | 200 req/min | 20 req/s | `X-RateLimit-Reset` |
| Task Creation | 50 req/min | 5 req/s | |
| Search | 100 req/min | 10 req/s | |
| File Upload | 20 req/min | 2 req/s | |

Response khi bị rate limit: `429 Too Many Requests`

---

## 2. Tasks API

### 2.1 Create Task

```
POST /api/v1/tasks
```

**Request Body:**

```json
{
    "title": "Implement WIP enforcement UI",
    "description": "Build the dialog that blocks users from exceeding WIP limit...",
    "project_id": "proj-uuid-001",
    "estimated_effort_hours": 4.0,
    "is_urgent": true,
    "is_important": true,
    "requested_deadline": "2026-04-01T17:00:00Z",
    "assigned_to": "user-uuid-001",
    "tags": ["frontend", "wip"]
}
```

**Validation Rules:**
- `title`: required, ≥ 10 chars, should start with a verb
- `estimated_effort_hours`: required, > 0. If ≤ 0.033 (2 min) → suggest Quick Strike
- `project_id`: required, must exist and belong to user's org
- `is_urgent`, `is_important`: required booleans → auto-classify Eisenhower

**Response: `201 Created`**

```json
{
    "data": {
        "id": "task-uuid-001",
        "title": "Implement WIP enforcement UI",
        "status": "quarantine",
        "eisenhower_quadrant": "Q1",
        "estimated_effort_hours": 4.0,
        "hofstadter_multiplier": 1.30,
        "scheduled_duration_hours": 5.20,
        "created_at": "2026-03-19T07:00:00Z"
    },
    "meta": {
        "quarantine_reason": "Q1 task requires triage",
        "suggested_action": "Manager must process via Trade-off Engine"
    }
}
```

### 2.2 Get Task

```
GET /api/v1/tasks/{task_id}
```

**Response: `200 OK`**

```json
{
    "data": {
        "id": "task-uuid-001",
        "title": "Implement WIP enforcement UI",
        "description": "Build the dialog...",
        "status": "doing",
        "eisenhower_quadrant": "Q1",
        "estimated_effort_hours": 4.0,
        "scheduled_duration_hours": 5.20,
        "assigned_to": {
            "id": "user-uuid-001",
            "full_name": "Developer One",
            "avatar_url": "..."
        },
        "created_by": {
            "id": "user-uuid-002",
            "full_name": "Project Manager"
        },
        "project": {
            "id": "proj-uuid-001",
            "name": "Tulie Workspace MVP"
        },
        "tags": [
            {"id": "tag-001", "name": "frontend", "color": "#1E88E5"}
        ],
        "dependencies": {
            "blocked_by": [],
            "blocks": ["task-uuid-003"]
        },
        "actual_start": "2026-03-19T08:00:00Z",
        "actual_end": null,
        "carried_over_count": 0,
        "created_at": "2026-03-19T07:00:00Z",
        "updated_at": "2026-03-19T08:00:00Z"
    }
}
```

### 2.3 List Tasks

```
GET /api/v1/tasks?status=doing&assigned_to=user-uuid-001&limit=20&cursor=xxx
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status (comma-separated for multiple) |
| `assigned_to` | uuid | Filter by assignee |
| `project_id` | uuid | Filter by project |
| `eisenhower` | string | Filter by quadrant: Q1, Q2, Q3, Q4 |
| `cycle_id` | uuid | Filter by cycle |
| `carried_over` | boolean | Only carried-over tasks |
| `priority` | string | Sort by priority |
| `limit` | int | Max results (default: 20, max: 100) |
| `cursor` | string | Pagination cursor |

**Response: `200 OK`**

```json
{
    "data": [...],
    "pagination": {
        "cursor": "eyJpZCI6InRhc2stMDIwIn0=",
        "has_more": true,
        "total_count": 42
    }
}
```

### 2.4 Update Task Status

```
PATCH /api/v1/tasks/{task_id}/status
```

**Request Body:**

```json
{
    "status": "doing",
    "note": "Starting deep work session"
}
```

**Business Rules Applied:**
- If transition to `doing` → WIP check enforced
- If WIP exceeded → `409 Conflict` with WIP details
- If task has unmet dependencies → `409 Conflict`
- Auto-sets `actual_start` / `actual_end`

**Response (success): `200 OK`**

```json
{
    "data": {
        "id": "task-uuid-001",
        "status": "doing",
        "actual_start": "2026-03-19T08:00:00Z"
    }
}
```

**Response (WIP blocked): `409 Conflict`**

```json
{
    "error": {
        "code": "WIP_LIMIT_EXCEEDED",
        "message": "You have reached your WIP limit (2/2 tasks in Doing)",
        "details": {
            "current_doing": 2,
            "wip_limit": 2,
            "doing_tasks": [
                {"id": "task-001", "title": "Fix login bug"},
                {"id": "task-002", "title": "Design dashboard"}
            ],
            "suggested_actions": ["complete", "pause", "request_override"]
        }
    }
}
```

### 2.5 Bulk Operations

```
POST /api/v1/tasks/bulk
```

**Request Body:**

```json
{
    "operations": [
        {"action": "update_status", "task_id": "task-001", "status": "done"},
        {"action": "assign", "task_id": "task-002", "assigned_to": "user-003"},
        {"action": "add_tag", "task_id": "task-003", "tag_id": "tag-001"}
    ]
}
```

Max 100 operations per request.

---

## 3. WIP API

### 3.1 Get User WIP Status

```
GET /api/v1/users/{user_id}/wip
```

**Response: `200 OK`**

```json
{
    "data": {
        "user_id": "user-uuid-001",
        "current_doing": 1,
        "wip_limit": 2,
        "slots_available": 1,
        "doing_tasks": [
            {
                "id": "task-001",
                "title": "Implement Focus Mode",
                "actual_start": "2026-03-19T08:00:00Z",
                "elapsed_hours": 2.5
            }
        ],
        "ready_queue": [
            {
                "id": "task-005",
                "title": "Build Quick Strike bar",
                "priority": 1
            }
        ]
    }
}
```

### 3.2 Request WIP Override

```
POST /api/v1/wip/override
```

**Request Body (Manager only):**

```json
{
    "user_id": "user-uuid-001",
    "reason": "Critical production bug needs immediate attention alongside current work",
    "duration_hours": 4
}
```

**Validation:** `reason` must be ≥ 20 characters.

---

## 4. Quick Strike API

### 4.1 Create Quick Strike

```
POST /api/v1/quick-strike
```

**Request Body:**

```json
{
    "description": "Reply to client email about timeline"
}
```

**Validation:** `description` max 200 chars. If > 50 chars → include suggestion in response.

**Response: `201 Created`**

```json
{
    "data": {
        "id": "qs-uuid-001",
        "description": "Reply to client email about timeline",
        "completed_at": "2026-03-19T07:15:00Z"
    },
    "meta": {
        "daily_count": 5,
        "suggest_formal_task": false
    }
}
```

---

## 5. Cycles API

### 5.1 Get Current Cycle

```
GET /api/v1/cycles/current
```

**Response: `200 OK`**

```json
{
    "data": {
        "id": "cycle-uuid-001",
        "name": "Q1-2026 Cycle",
        "status": "active",
        "start_date": "2026-01-06",
        "end_date": "2026-03-28",
        "buffer_week_start": "2026-03-30",
        "current_week": 11,
        "total_weeks": 12,
        "days_remaining": 9,
        "goals": [
            {"title": "Launch MVP", "progress": 75.0},
            {"title": "Onboard 5 beta users", "progress": 40.0}
        ],
        "milestones": [
            {"id": "ms-1", "name": "Core Task Module", "target_date": "2026-01-31", "completion_rate": 100.0},
            {"id": "ms-2", "name": "WIP & Focus Mode", "target_date": "2026-02-28", "completion_rate": 85.0},
            {"id": "ms-3", "name": "Board & Notifications", "target_date": "2026-03-28", "completion_rate": 45.0}
        ],
        "stats": {
            "total_tasks": 42,
            "done_tasks": 28,
            "doing_tasks": 5,
            "carried_over_tasks": 3,
            "completion_rate": 66.7
        }
    }
}
```

### 5.2 Create Cycle

```
POST /api/v1/cycles
```

**Request Body:**

```json
{
    "name": "Q2-2026 Cycle",
    "start_date": "2026-04-06",
    "goals": [
        {"title": "Quarantine & Trade-off Engine"},
        {"title": "Auto-Scheduling MVP"}
    ],
    "milestones": [
        {"name": "Quarantine Zone", "week": 4},
        {"name": "Trade-off Engine", "week": 8},
        {"name": "Auto-Schedule Beta", "week": 12}
    ]
}
```

`end_date` is auto-calculated as `start_date + 12 weeks`.  
`buffer_week_start` is auto-calculated as `end_date + 1 day`.

---

## 6. Search API

### 6.1 Global Search

```
GET /api/v1/search?q=WIP+enforcement&type=tasks&limit=10
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | Filter by type: `tasks`, `comments`, `attachments`, `all` |
| `status` | string | Filter tasks by status |
| `assigned_to` | uuid | Filter by assignee |
| `project_id` | uuid | Filter by project |
| `limit` | int | Max results (default: 20) |
| `offset` | int | Offset for pagination |

**Response: `200 OK`**

```json
{
    "data": {
        "tasks": [
            {
                "id": "task-001",
                "title": "Implement WIP enforcement UI",
                "status": "doing",
                "relevance_score": 0.95,
                "highlight": "Implement <mark>WIP enforcement</mark> UI"
            }
        ],
        "comments": [
            {
                "id": "comment-001",
                "task_id": "task-002",
                "content_preview": "...the <mark>WIP enforcement</mark> should block...",
                "relevance_score": 0.72
            }
        ]
    },
    "meta": {
        "total_results": 15,
        "query_time_ms": 12
    }
}
```

---

## 7. Trade-off API

### 7.1 Process Quarantine Task

```
POST /api/v1/tasks/{task_id}/trade-off
```

**Request Body (Manager only):**

```json
{
    "decision": "swap",
    "affected_task_id": "task-uuid-005",
    "reason": "Critical production bug found — swapping with lower-priority feature task to maintain WIP discipline"
}
```

**Validation:**
- `decision`: required, one of `swap`, `add_resource`, `reduce_scope`, `extend_deadline`, `reject`
- `reason`: required, ≥ 20 characters
- `affected_task_id`: required if decision = `swap`

**Response: `200 OK`**

```json
{
    "data": {
        "task": {
            "id": "task-uuid-001",
            "status": "ready",
            "previous_status": "quarantine"
        },
        "affected_task": {
            "id": "task-uuid-005",
            "status": "on_hold",
            "previous_status": "doing"
        },
        "trade_off_log": {
            "id": "tol-uuid-001",
            "decision": "swap",
            "decided_at": "2026-03-19T09:00:00Z"
        }
    }
}
```

---

## 8. Webhooks API

### 8.1 Register Webhook

```
POST /api/v1/webhooks
```

**Request Body:**

```json
{
    "url": "https://example.com/webhook",
    "secret": "whsec_xxxxxxxxxxxx",
    "events": ["task.status_changed", "task.completed", "wip.override", "cycle.completed"]
}
```

### 8.2 Webhook Payload Format

```json
{
    "id": "evt-uuid-001",
    "type": "task.status_changed",
    "created_at": "2026-03-19T08:30:00Z",
    "data": {
        "task_id": "task-uuid-001",
        "from_status": "ready",
        "to_status": "doing",
        "changed_by": "user-uuid-001"
    }
}
```

**Signature Verification:**

```
X-Tulie Workspace-Signature: sha256=HMAC(payload, secret)
```

**Retry Policy:** 3 attempts with exponential backoff (1s, 5s, 25s).

**Available Events:**

| Event | Trigger |
|-------|---------|
| `task.created` | New task created |
| `task.status_changed` | Task status transition |
| `task.assigned` | Task assignee changed |
| `task.completed` | Task moved to Done |
| `wip.override` | WIP limit manually overridden |
| `cycle.started` | New cycle activated |
| `cycle.completed` | Cycle closed |
| `quarantine.new` | Task entered quarantine |
| `quarantine.escalated` | Quarantine task escalated |
| `trade_off.decided` | Trade-off decision made |

---

## 9. WebSocket Events

### 9.1 Connection

```javascript
// Client-side connection
const ws = new WebSocket('wss://app.tulie-workspace.app/ws?token=<jwt>')
```

### 9.2 Subscribe / Unsubscribe

```json
// Subscribe
{"action": "subscribe", "channel": "board:proj-uuid-001"}

// Unsubscribe  
{"action": "unsubscribe", "channel": "board:proj-uuid-001"}
```

### 9.3 Event Format

```json
{
    "channel": "board:proj-uuid-001",
    "event": "task.status_changed",
    "data": {
        "task_id": "task-uuid-001",
        "from": "ready",
        "to": "doing",
        "user_id": "user-uuid-001",
        "timestamp": "2026-03-19T08:30:00Z"
    }
}
```

---

## 10. Error Response Format

Tất cả errors theo format thống nhất:

```json
{
    "error": {
        "code": "ERROR_CODE_HERE",
        "message": "Human-readable message",
        "details": {},
        "request_id": "req-uuid-001",
        "timestamp": "2026-03-19T07:00:00Z"
    }
}
```

**Common HTTP Status Codes:**

| Code | Meaning | Ví dụ |
|------|---------|-------|
| 200 | Success | GET, PATCH thành công |
| 201 | Created | POST thành công |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | WIP limit, dependency conflict |
| 422 | Unprocessable | Business rule violation |
| 429 | Rate Limited | Quá nhiều requests |
| 500 | Server Error | Unexpected error |

> Chi tiết error codes → xem [07_ERROR_CODE_CATALOG.md](./07_ERROR_CODE_CATALOG.md)

---

> **Tài liệu liên quan:**
> - [PRD.md](../PRD.md) §11 — API requirements
> - [02_DATABASE_SCHEMA.md](./02_DATABASE_SCHEMA.md) — Data models
> - [04_SECURITY_MODEL.md](./04_SECURITY_MODEL.md) — Auth & RBAC details
> - [07_ERROR_CODE_CATALOG.md](./07_ERROR_CODE_CATALOG.md) — Full error catalog
