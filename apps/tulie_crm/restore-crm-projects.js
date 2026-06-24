const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    await client.connect();
    console.log('Connected to Database. Starting CRM projects table restore...');

    // 1. Add CRM columns to public.projects
    console.log('Altering public.projects to add missing CRM columns...');
    await client.query(`
        ALTER TABLE public.projects 
        ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS title TEXT,
        ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS start_date DATE,
        ADD COLUMN IF NOT EXISTS end_date DATE,
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('CRM columns added successfully.');

    // 2. Define the missing projects
    const missingProjects = [
        {
            id: 'bbec56ee-7688-4e46-b208-96ffc5b80e3e',
            title: 'Xây dựng website Hamedco',
            customer_id: '44cfb3d7-8120-4650-86e0-aa4491b2f994',
            contract_id: '2c16e3e3-ae05-4b51-8087-75c7967f3fbc', // B2B contract id
            description: 'Dự án Thiết kế & Phát triển Website Doanh nghiệp HAMEDCO / Trần Minh Med'
        },
        {
            id: 'd7e49a3a-c8a5-4554-921a-a87171860eac',
            title: 'Thiết kế Hệ diện Thương hiệu VSTEM Space Academy',
            customer_id: '2843cd83-c308-4988-b6ef-12e2d6ba1523',
            contract_id: '48ec5a59-7436-4a05-9e19-015e926304b1', // VSTEM contract id
            description: 'Dự án Thiết kế Hệ thống Nhận diện Thương hiệu VSTEM Space Academy'
        },
        {
            id: 'e7a45dc5-fca6-4a7e-9c8e-a3cdc142a8b1',
            title: 'Thiết kế Lễ Khánh thành & Khai trương VNSC',
            customer_id: 'c335a022-f5e2-4867-a5a2-644b3940baa2',
            contract_id: null,
            description: 'Thiết kế Lễ Khánh thành & Lễ Khai trương cho Trung tâm Vũ trụ Việt Nam (VNSC)'
        },
        {
            id: 'dedbeeba-0e84-4df9-ab8d-21b9d86dee6a',
            title: 'Thiết kế Website & Hệ thống số cho VNSC',
            customer_id: 'c335a022-f5e2-4867-a5a2-644b3940baa2',
            contract_id: null,
            description: 'Thiết kế website doanh nghiệp, email marketing và landing page cho VNSC'
        },
        {
            id: '79773361-9919-42a3-a38e-5c858ea3b5a5',
            title: 'Phát triển Website B2B SFSV',
            customer_id: '1680de0f-cf4a-45f1-9416-40c54be8c7e8',
            contract_id: null,
            description: 'Báo giá Phát triển Website B2B SFSV, quản lý vận hành AI Agent'
        }
    ];

    // 3. Upsert missing projects
    console.log('Inserting/rebuilding missing projects...');
    for (const proj of missingProjects) {
        await client.query(`
            INSERT INTO public.projects (
                id, 
                title, 
                name, 
                customer_id, 
                contract_id, 
                description, 
                cycle_id, 
                organization_id, 
                status, 
                priority,
                created_at,
                updated_at
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, 
                'c0000000-0000-0000-0000-000000000001', -- cycle_id
                'a0000000-0000-0000-0000-000000000001', -- organization_id
                'active',                               -- status (enum value)
                'high',                                 -- priority (enum value)
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                name = EXCLUDED.name,
                customer_id = EXCLUDED.customer_id,
                contract_id = EXCLUDED.contract_id,
                description = EXCLUDED.description,
                updated_at = NOW();
        `, [proj.id, proj.title, proj.title, proj.customer_id, proj.contract_id, proj.description]);
        console.log(`Upserted project: ${proj.title} (ID: ${proj.id})`);
    }

    console.log('Database restore completed successfully!');
    await client.end();
}

run().catch(err => {
    console.error('Error during run:', err);
    process.exit(1);
});
