#!/bin/bash
# Session Context Manager - Place in PATH or alias

SESSION_FILE="/Users/tungnguyen/Documents/code/tulie_one/SESSION.md"

show_context() {
    if [ -f "$SESSION_FILE" ]; then
        echo "=== LAST SESSION ==="
        cat "$SESSION_FILE"
        echo "===================="
    else
        echo "No previous session found."
    fi
}

update_context() {
    echo "$1" > "$SESSION_FILE"
    echo "Context updated."
}

case "$1" in
    show) show_context ;;
    save) update_context "$2" ;;
    *) echo "Usage: session [show|save \"context text\"]" ;;
esac
