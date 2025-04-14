const fs = require('fs');
const path = require('path');

const apps = ['tulie_erp', 'tulie_workforce', 'tulie_workspace'];
apps.forEach(app => {
  const dir = path.join('/Users/tungnguyen/Documents/code/tulie_one/apps', app);
  if (!fs.existsSync(dir)) return;
  
  const walk = (d) => {
    fs.readdirSync(d).forEach(f => {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) {
         if (f !== 'node_modules' && f !== '.next') walk(p);
      } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
         let c = fs.readFileSync(p, 'utf8');
         let orig = c;
         
         const regex1 = /from ['"]@\/components\/ui\/[a-zA-Z0-9-]+['"]/g;
         const regex2 = /from ['"]@\/components\/ui['"]/g;
         
         c = c.replace(regex1, 'from "@repo/ui"');
         c = c.replace(regex2, 'from "@repo/ui"');
         
         if (c !== orig) {
            console.log("Updated: " + p);
            fs.writeFileSync(p, c, 'utf8');
         }
      }
    });
  };
  
  console.log('Migrating ' + app + '...');
  walk(dir);
});

console.log('All migrations finished successfully!');
