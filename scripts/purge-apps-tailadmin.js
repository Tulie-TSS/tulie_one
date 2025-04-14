const fs = require('fs')
const path = require('path')

const APPS_DIR = path.join(__dirname, '../apps')

const replacements = [
    // Colors Background
    { match: /\bbg-zinc-100\/50\b/g, replace: 'bg-muted/50' },
    { match: /\bbg-zinc-100\/20\b/g, replace: 'bg-muted/20' },
    { match: /\bbg-zinc-100\b/g, replace: 'bg-muted' },
    { match: /\bbg-zinc-50\/80\b/g, replace: 'bg-muted/80' },
    { match: /\bbg-zinc-50\/50\b/g, replace: 'bg-muted/50' },
    { match: /\bbg-zinc-50\b/g, replace: 'bg-muted' },
    { match: /\bbg-zinc-200\b/g, replace: 'bg-muted' },
    
    // Borders
    { match: /\bborder-border\/50\b/g, replace: 'border-border' },
    { match: /\bborder-zinc-100\b/g, replace: 'border-border' },
    { match: /\bborder-zinc-200\/50\b/g, replace: 'border-border' },
    { match: /\bborder-zinc-200\/80\b/g, replace: 'border-border' },
    { match: /\bborder-zinc-200\b/g, replace: 'border-border' },
    { match: /\bborder-zinc-300\b/g, replace: 'border-input' },

    // Text Colors
    { match: /\btext-zinc-500\b/g, replace: 'text-muted-foreground' },
    { match: /\btext-zinc-600\b/g, replace: 'text-muted-foreground' },
    { match: /\btext-zinc-400\b/g, replace: 'text-muted-foreground' },
    { match: /\btext-zinc-900\b/g, replace: 'text-foreground' },
    { match: /\btext-zinc-950\b/g, replace: 'text-foreground' },
    
    // Border Radius
    { match: /\brounded-2xl\b/g, replace: 'rounded-xl' }, // tone down
    { match: /\brounded-xl\b/g, replace: 'rounded-md' },

    // Shadows
    { match: /\bshadow-md shadow-zinc-200\b/g, replace: 'shadow-sm' },
    { match: /\bshadow-sm shadow-zinc-100\b/g, replace: 'shadow-sm' },
    { match: /\bshadow-zinc-200\b/g, replace: '' },
    { match: /\bshadow-zinc-100\b/g, replace: '' },

    // Typography
    { match: /\btracking-tight\b/g, replace: '' },

    // Hover Animations (TailAdmin specifics)
    { match: /\bhover:shadow-md hover:-translate-y-0\.5\b/g, replace: 'hover:bg-accent' },
    { match: /\bhover:-translate-y-0\.5\b/g, replace: '' },
    { match: /\bhover:-translate-y-1\b/g, replace: '' },
    { match: /\bhover:scale-\[1\.02\]\b/g, replace: '' },

    // Ease
    { match: /\bease-apple\b/g, replace: 'ease-out' },

    // Backdrop Blur
    { match: /\bbackdrop-blur-xl bg-white\/80\b/g, replace: 'bg-background' },
    { match: /\bbackdrop-blur-xl bg-card\/95\b/g, replace: 'bg-card' },
]

function walkDir(dir) {
    let files = []
    const list = fs.readdirSync(dir)
    for (const file of list) {
        if (file === 'node_modules' || file === '.next' || file === 'build') continue
        
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)
        
        if (stat.isDirectory()) {
            files = files.concat(walkDir(filePath))
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            files.push(filePath)
        }
    }
    return files
}

function processFiles() {
    const allFiles = walkDir(APPS_DIR)
    let totalChanges = 0

    for (const filePath of allFiles) {
        let content = fs.readFileSync(filePath, 'utf8')
        let original = content
        let changed = false

        for (const rule of replacements) {
            if (rule.match.test(content)) {
                content = content.replace(rule.match, rule.replace)
                changed = true
            }
        }

        // Cleanup multiple spaces in className strings that might be left over from replacing with empty string
        if (changed) {
            content = content.replace(/className="([^"]+)"/g, (match, p1) => {
                const cleaned = p1.replace(/\s+/g, ' ').trim()
                return `className="${cleaned}"`
            })
            content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
                const cleaned = p1.replace(/\s+/g, ' ').trim()
                return `className={\`${cleaned}\`}`
            })

            fs.writeFileSync(filePath, content, 'utf8')
            totalChanges++
        }
    }

    console.log(`✅ Processed ${allFiles.length} files in apps/ directory.`)
    console.log(`✅ Fixed TailAdmin deviations in ${totalChanges} files.`)
}

processFiles()
