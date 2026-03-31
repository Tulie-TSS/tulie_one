require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seed() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database!');

    const sqlPath = path.join(__dirname, 'scripts', 'seed_demo_project.sql');
    let sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Fix brand_type to 'agency' instead of 'tulie'
    sqlScript = sqlScript.replace("v_brand TEXT := 'tulie';", "v_brand TEXT := 'agency';");
    
    // Fix 'description' column in quotations which doesn't exist, use 'notes' instead
    sqlScript = sqlScript.replace(/INSERT INTO quotations \(id, quotation_number, customer_id, created_by, status, type, title, description, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at\)/g, 
        "INSERT INTO quotations (id, quotation_number, customer_id, created_by, status, type, title, notes, subtotal, vat_percent, vat_amount, total_amount, valid_until, public_token, brand, project_id, created_at, updated_at)");

    // Remove the UPDATE projects SET milestones block because milestones table structure changed
    const milestoneStart = sqlScript.indexOf('-- 5. CREATE MILESTONES');
    if (milestoneStart !== -1) {
        // Find the next RAISE NOTICE or end of script
        const endPart = sqlScript.indexOf('RAISE NOTICE', milestoneStart);
        if (endPart !== -1) {
            sqlScript = sqlScript.substring(0, milestoneStart) + sqlScript.substring(endPart);
        }
    }

    console.log('Executing seed script...');
    await client.query(sqlScript);

    // Get the tokens to display link to user
    const { rows } = await client.query(`
      SELECT q.public_token, c.company_name, q.title 
      FROM quotations q 
      JOIN customers c ON q.customer_id = c.id
      WHERE q.title LIKE '%Website Doanh nghiệp%' 
      ORDER BY q.created_at DESC LIMIT 1
    `);

    if (rows.length > 0) {
      console.log('\n✅ Demo data injected successfully!');
      console.log('======================================================');
      console.log('Bạn có thể truy cập link Portal Báo giá demo dưới đây:');
      console.log(`🔗 ${process.env.NEXT_PUBLIC_APP_URL}/quote/${rows[0].public_token}`);
      console.log('======================================================\n');
    } else {
        console.log('Seed executed, but no matching quote found to show link.');
    }

  } catch (err) {
    console.error('Error executing script:', err);
  } finally {
    await client.end();
  }
}

seed();
