#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const SESSION_FILE = path.join(__dirname, "../.agents/session-context.json");

function read() {
  return JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
}

function write(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
}

const raw = process.argv.slice(2).join(" ");
const input = raw.toLowerCase().trim();

function save() {
  write(read());
  console.log("✓ Đã lưu context");
}

function show() {
  const s = read();
  console.log(`\n📁 ${s.project} | ${s.lastUpdated}\n`);
  if (s.currentWork) console.log(`🔧 Đang làm: ${s.currentWork}`);
  if (s.recentlyCompleted.length) {
    console.log("\n✅ Đã xong:");
    s.recentlyCompleted.slice(-3).forEach((i) => console.log(`   • ${i}`));
  }
  if (s.pendingTasks.length) {
    console.log("\n📋 Cần làm:");
    s.pendingTasks.forEach((i) => console.log(`   • ${i}`));
  }
  if (s.keyDecisions.length) {
    console.log("\n💡 Quyết định:");
    s.keyDecisions.slice(-2).forEach((i) => console.log(`   • ${i}`));
  }
  if (s.notes.length) {
    console.log("\n📝 Ghi chú:");
    s.notes.slice(-2).forEach((i) => console.log(`   • ${i}`));
  }
  console.log("");
}

// Pattern matching cho tiếng Việt tự nhiên
const patterns = [
  // Save
  { test: /^lưu\s*(context|trạng thái)?$/i, action: () => save() },
  { test: /^save$/i, action: () => save() },
  { test: /^s$/i, action: () => save() },

  // Show
  { test: /^xem\s*(context|trạng thái)?$/i, action: () => show() },
  { test: /^show$/i, action: () => show() },
  { test: /^v$/i, action: () => show() },

  // Đang làm
  {
    test: /^đang làm (.+)/i,
    action: (m) => {
      const s = read();
      s.currentWork = m[1];
      write(s);
      console.log(`✓ Đang làm: ${m[1]}`);
    },
  },
  {
    test: /^dang lam (.+)/i,
    action: (m) => {
      const s = read();
      s.currentWork = m[1];
      write(s);
      console.log(`✓ Đang làm: ${m[1]}`);
    },
  },
  {
    test: /^working on (.+)/i,
    action: (m) => {
      const s = read();
      s.currentWork = m[1];
      write(s);
      console.log(`✓ Đang làm: ${m[1]}`);
    },
  },

  // Xong
  {
    test: /^xong (.+)/i,
    action: (m) => {
      const s = read();
      s.recentlyCompleted.push(m[1]);
      if (
        s.currentWork &&
        m[1].toLowerCase().startsWith(s.currentWork.toLowerCase().split(" ")[0])
      )
        s.currentWork = null;
      write(s);
      console.log(`✓ Đã xong: ${m[1]}`);
    },
  },
  {
    test: /^done (.+)/i,
    action: (m) => {
      const s = read();
      s.recentlyCompleted.push(m[1]);
      if (
        s.currentWork &&
        m[1].toLowerCase().startsWith(s.currentWork.toLowerCase().split(" ")[0])
      )
        s.currentWork = null;
      write(s);
      console.log(`✓ Đã xong: ${m[1]}`);
    },
  },
  {
    test: /^hoàn thành (.+)/i,
    action: (m) => {
      const s = read();
      s.recentlyCompleted.push(m[1]);
      if (
        s.currentWork &&
        m[1].toLowerCase().startsWith(s.currentWork.toLowerCase().split(" ")[0])
      )
        s.currentWork = null;
      write(s);
      console.log(`✓ Đã xong: ${m[1]}`);
    },
  },

  // Cần làm / Thêm task
  {
    test: /^(cần làm|can lam|thêm|tính làm|sẽ làm) (.+)/i,
    action: (m) => {
      const s = read();
      s.pendingTasks.push(m[2]);
      write(s);
      console.log(`✓ Thêm việc cần làm: ${m[2]}`);
    },
  },
  {
    test: /^todo (.+)/i,
    action: (m) => {
      const s = read();
      s.pendingTasks.push(m[1]);
      write(s);
      console.log(`✓ Thêm việc cần làm: ${m[1]}`);
    },
  },
  {
    test: /^add (.+)/i,
    action: (m) => {
      const s = read();
      s.pendingTasks.push(m[1]);
      write(s);
      console.log(`✓ Thêm việc cần làm: ${m[1]}`);
    },
  },

  // Ghi chú
  {
    test: /^(ghi chú|ghi chu|note) (.+)/i,
    action: (m) => {
      const s = read();
      s.notes.push(m[2]);
      write(s);
      console.log(`✓ Ghi chú: ${m[2]}`);
    },
  },

  // Quyết định
  {
    test: /^(quyết định|quyet dinh|decision) (.+)/i,
    action: (m) => {
      const s = read();
      s.keyDecisions.push(m[2]);
      write(s);
      console.log(`✓ Quyết định: ${m[2]}`);
    },
  },

  // Xóa task đã xong
  {
    test: /^clear$/i,
    action: () => {
      const s = read();
      s.currentWork = null;
      s.recentlyCompleted = [];
      write(s);
      console.log("✓ Đã clear");
    },
  },
];

let matched = false;
for (const p of patterns) {
  const m = input.match(p.test);
  if (m) {
    p.action(m);
    matched = true;
    break;
  }
}

if (!matched) {
  console.log(`\n📁 Session Context - Nói tiếng Việt tự nhiên:

Ví dụ:
  node scripts/s.js lưu                              # Lưu context
  node scripts/s.js xem                                # Xem context
  node scripts/s.js đang làm implement login          # Đang làm gì
  node scripts/s.js xong fix auth bug                 # Đã xong gì
  node scripts/s.js cần làm thêm WIP validation       # Việc cần làm
  node scripts/s.js ghi chú dùng Zustand thay vì Redux # Ghi chú
  node scripts/s.js quyết định chuyển sang SSR         # Quyết định

Từ khóa: lưu, xem, đang làm, xong, cần làm, ghi chú, quyết định
`);
}
