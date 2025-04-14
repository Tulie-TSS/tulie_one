const { Client } = require('pg');
const fs = require('fs');
const crypto = require('crypto');

// Parse .env.local manually to ensure we get the right string
const envConfig = fs.readFileSync('apps/tulie_crm/.env.local', 'utf8');
const dbUrlMatch = envConfig.match(/DIRECT_URL="([^"]+)"/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

if (!dbUrl) {
    console.error("No valid DB URL found.");
    process.exit(1);
}

const client = new Client({
  connectionString: dbUrl
});

async function run() {
  await client.connect();
  console.log('Connected to DB');

  try {
    // 1. Add column if not exists
    await client.query(`
      ALTER TABLE public.contracts 
      ADD COLUMN IF NOT EXISTS public_token text UNIQUE;
    `);
    console.log('public_token column checked/added to contracts table.');

    // 2. Generate tokens for existing contracts that don't have one
    const res = await client.query(`SELECT id FROM public.contracts WHERE public_token IS NULL`);
    const contracts = res.rows;
    console.log(`Found ${contracts.length} contracts needing public_tokens.`);

    for (const contract of contracts) {
      const token = 'ct_' + crypto.randomBytes(16).toString('hex');
      await client.query(`UPDATE public.contracts SET public_token = $1 WHERE id = $2`, [token, contract.id]);
    }
    console.log('Successfully updated existing contracts.');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}

run();
