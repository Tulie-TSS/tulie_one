#!/usr/bin/env node
/**
 * Session Context Update Script
 * Usage: node scripts/update-session.js <action> [params]
 *
 * Actions:
 *   show                    - Display current session context
 *   update <field> <value>  - Update a field (recentlyCompleted, currentWork, pendingTasks, keyDecisions)
 *   complete <item>         - Mark item as complete (moves to recentlyCompleted)
 *   add-pending <task>      - Add to pendingTasks
 *   decide <decision>       - Add to keyDecisions
 *   touch                   - Update lastUpdated timestamp only
 */

const fs = require("fs");
const path = require("path");

const SESSION_FILE = path.join(__dirname, "../.agents/session-context.json");

function readSession() {
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
  } catch (e) {
    console.error("Error reading session file:", e.message);
    process.exit(1);
  }
}

function writeSession(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  console.log(`✓ Updated: ${data.lastUpdated}`);
}

function show() {
  const session = readSession();
  console.log("\n=== Session Context ===");
  console.log(`Project: ${session.project}`);
  console.log(`Updated: ${session.lastUpdated}`);
  console.log(`\nStatus:`);
  Object.entries(session.status).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });
  if (session.currentWork) {
    console.log(`\nCurrent Work: ${session.currentWork}`);
  }
  if (session.recentlyCompleted.length) {
    console.log(`\nRecently Completed:`);
    session.recentlyCompleted.forEach((item) => console.log(`  - ${item}`));
  }
  if (session.pendingTasks.length) {
    console.log(`\nPending Tasks:`);
    session.pendingTasks.forEach((item) => console.log(`  - ${item}`));
  }
  if (session.keyDecisions.length) {
    console.log(`\nKey Decisions:`);
    session.keyDecisions.forEach((item) => console.log(`  - ${item}`));
  }
  if (session.notes.length) {
    console.log(`\nNotes:`);
    session.notes.forEach((item) => console.log(`  - ${item}`));
  }
  console.log("");
}

function updateField(field, value) {
  const session = readSession();
  if (Array.isArray(session[field])) {
    session[field].push(value);
  } else {
    session[field] = value;
  }
  writeSession(session);
}

function complete(item) {
  const session = readSession();
  session.recentlyCompleted.push(item);
  session.currentWork = null;
  writeSession(session);
}

function addPending(task) {
  const session = readSession();
  session.pendingTasks.push(task);
  writeSession(session);
}

function decide(decision) {
  const session = readSession();
  session.keyDecisions.push(decision);
  writeSession(session);
}

function touch() {
  const session = readSession();
  writeSession(session);
}

// Main
const [action, ...args] = process.argv.slice(2);

switch (action) {
  case "show":
    show();
    break;
  case "update":
    updateField(args[0], args.slice(1).join(" "));
    break;
  case "complete":
    complete(args.join(" "));
    break;
  case "add-pending":
    addPending(args.join(" "));
    break;
  case "decide":
    decide(args.join(" "));
    break;
  case "touch":
    touch();
    break;
  default:
    console.log(`Usage: node update-session.js <action> [params]
Actions: show, update <field> <value>, complete <item>, add-pending <task>, decide <decision>, touch`);
}
