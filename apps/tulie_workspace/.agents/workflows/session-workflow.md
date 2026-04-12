---
description: Quy trình lưu và khôi phục session context giữa các phiên làm việc
---

# Session Context Workflow

## Mục đích

Lưu trữ context giữa các phiên làm việc để agent có thể nhanh chóng hiểu:

- Project đang ở trạng thái nào
- Đã hoàn thành những gì
- Đang làm gì
- Còn việc gì cần làm

## File chính

**`session-context.json`** - Lưu trữ toàn bộ state của project

## Cách sử dụng

### 1. Khi bắt đầu phiên mới

Agent sẽ tự động đọc `session-context.json` tại phiên start.

### 2. Trong phiên làm việc

#### Cập nhật `currentWork`

Khi bắt đầu làm task mới:

```
/session update currentWork "Implement login page with Supabase Auth"
```

#### Đánh dấu hoàn thành

Khi xong một task lớn:

```
/session complete "Supabase migrations"
```

#### Thêm pending task

Khi phát hiện việc cần làm:

```
/session add-pending "Add WIP limit validation"
```

#### Ghi nhận decision

Khi có quyết định quan trọng:

```
/session decide "Dùng Zustand cho client state, không dùng React Query cho UI state"
```

### 3. Khi kết thúc phiên

Chạy lệnh update session:

```bash
# Đọc session hiện tại
cat .agents/session-context.json

# Cập nhật lastUpdated = now
```

## Compact Format

Session context được thiết kế để:

- **Nhỏ gọn**: ~1-2KB, dưới 500 tokens
- **Đầy đủ**: Cover đủ context cần thiết
- **Dễ đọc**: JSON structure rõ ràng

## Schema

```typescript
interface SessionContext {
  project: string; // Tên project
  projectPath: string; // Absolute path
  lastUpdated: string; // ISO timestamp
  version: string; // Schema version

  status: {
    dbMigrations: Status;
    auth: Status;
    seedData: Status;
    uiConnected: Status;
    buildStatus: "passing" | "failing" | "unknown";
    typeCheck: "passing" | "failing" | "unknown";
  };

  techStack: Record<string, string>;

  recentlyCompleted: string[]; // Items vừa xong
  currentWork: string | null; // Đang làm gì
  pendingTasks: string[]; // Việc còn lại
  keyDecisions: string[]; // Quyết định quan trọng

  importantPaths: Record<string, string>;
  keyFiles: Record<string, string>;

  database: {
    supabaseProjectId: string;
    // ...
  };

  notes: string[];
}
```

## Lệnh hỗ trợ

| Lệnh                              | Mô tả                                           |
| --------------------------------- | ----------------------------------------------- |
| `/session show`                   | Hiển thị session context hiện tại               |
| `/session update <field> <value>` | Cập nhật field                                  |
| `/session complete <item>`        | Đánh dấu hoàn thành, move vào recentlyCompleted |
| `/session add-pending <task>`     | Thêm vào pendingTasks                           |
| `/session decide <decision>`      | Thêm key decision                               |

## Quy tắc

1. **Không spam** - Chỉ cập nhật khi có thay đổi đáng kể
2. **Nhỏ gọn** - Mỗi item tối đa 1-2 câu
3. **Có tiêu đề** - `currentWork` phải mô tả rõ WHAT + WHY ngắn gọn
4. **Clean up** - Xóa items cũ không còn relevant

## Auto-update Script

Chạy script để cập nhật timestamp tự động:

```bash
# Zsh alias (thêm vào ~/.zshrc)
alias session-update='node -e "const fs=require(\"fs\");const c=JSON.parse(fs.readFileSync(\".agents/session-context.json\",\"utf8\"));c.lastUpdated=new Date().toISOString();fs.writeFileSync(\".agents/session-context.json\",JSON.stringify(c,null,2));console.log(\"Updated:\",c.lastUpdated)"'
```

## Session Start Checklist

Khi agent start, cần check:

- [ ] Read `session-context.json`
- [ ] Update `lastUpdated`
- [ ] Verify build/typecheck status (nếu có thay đổi)
- [ ] Report current work + pending tasks
