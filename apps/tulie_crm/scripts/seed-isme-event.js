const { readFileSync } = require('fs')

// Read env
const env = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
    const m = env.match(new RegExp(`${key}="([^"]+)"`))
    if (!m) {
        const m2 = env.match(new RegExp(`${key}=([^\\n]+)`))
        return m2 ? m2[1].trim() : null
    }
    return m[1]
}

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!url || !key) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

async function main() {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const eventData = {
        name: 'ISME Career Fair 2026',
        code: 'ISME2026',
        subdomains: ['isme.tulie.studio', 'localhost'],
        is_active: true,
        banner_text: 'Ưu đãi độc quyền ISME Career Fair — Thanh toán giữ chỗ ngay hôm nay!',
        hero_title: 'Chuẩn bị hồ sơ xin việc\nchuyên nghiệp cùng Tulie',
        hero_subtitle: 'Ảnh thẻ chuẩn Hàn Quốc & Website CV cá nhân — ưu đãi độc quyền tại ISME Career Fair 2026.',
        brand_name: 'ISME\nCareer Fair 2026',
        logo_url: null,
        deadline_time: null,
        services: [
            {
                id: 'photo_id_1',
                name: 'Ảnh thẻ',
                group: 'photo_id',
                originalPrice: 199000,
                salePrice: 139000,
                savingText: 'Tiết kiệm 60k',
                tagLabel: 'Phổ biến',
                tagStyle: 'tagHot',
                description: '1 ảnh sửa trang phục gốc + 1 kiểu ghép trang phục',
                addonPrice: 50000,
                addonLabel: '+50.000đ/kiểu nếu lấy thêm option trang phục',
                maxAddon: 5,
                maxSelect: 1,
                features: [
                    '1 ảnh chỉnh sửa trang phục gốc',
                    '1 ảnh ghép kiểu trang phục',
                    'File gốc chất lượng cao',
                    'Giao trong 24h'
                ]
            },
            {
                id: 'profile_3',
                name: 'Profile 3 ảnh',
                group: 'photo_profile',
                originalPrice: 599000,
                salePrice: 399000,
                savingText: 'Tiết kiệm 200k',
                tagLabel: 'Phổ biến',
                tagStyle: 'tagHot',
                description: '3 ảnh 3 góc sửa trang phục gốc + 3 ảnh ghép cùng 1 kiểu trang phục',
                addonPrice: 50000,
                addonLabel: '+50.000đ/kiểu nếu lấy thêm option trang phục khác',
                maxAddon: 5,
                maxSelect: 1,
                features: [
                    '3 ảnh 3 góc chỉnh sửa trang phục gốc',
                    '3 ảnh ghép cùng 1 kiểu trang phục',
                    'File gốc chất lượng cao'
                ]
            },
            {
                id: 'profile_5',
                name: 'Profile 5 ảnh',
                group: 'photo_profile',
                originalPrice: 999000,
                salePrice: 679000,
                savingText: 'Tiết kiệm 320k',
                tagLabel: 'Best value',
                tagStyle: 'tagBest',
                description: '5 ảnh 5 góc sửa trang phục gốc + 5 ảnh ghép cùng 1 kiểu trang phục',
                addonPrice: 50000,
                addonLabel: '+50.000đ/kiểu nếu lấy thêm option trang phục khác',
                maxAddon: 5,
                maxSelect: 1,
                features: [
                    '5 ảnh 5 góc chỉnh sửa trang phục gốc',
                    '5 ảnh ghép cùng 1 kiểu trang phục',
                    'File gốc chất lượng cao'
                ]
            },
            {
                id: 'profile_7',
                name: 'Profile 7 ảnh',
                group: 'photo_profile',
                originalPrice: 1399000,
                salePrice: 999000,
                savingText: 'Tiết kiệm 400k',
                description: '7 ảnh 7 góc sửa trang phục gốc + 7 ảnh ghép cùng 2 kiểu trang phục',
                addonPrice: 50000,
                addonLabel: '+50.000đ/kiểu nếu lấy thêm option trang phục khác',
                maxAddon: 5,
                maxSelect: 1,
                features: [
                    '7 ảnh 7 góc chỉnh sửa trang phục gốc',
                    '7 ảnh ghép cùng 2 kiểu trang phục',
                    'File gốc chất lượng cao'
                ]
            },
            {
                id: 'web_cv',
                name: 'Website CV',
                group: 'website',
                originalPrice: 1499000,
                salePrice: 499000,
                savingText: 'Tiết kiệm 1.000k',
                tagLabel: 'Hot deal',
                tagStyle: 'tagHot',
                description: 'Website CV cá nhân chuyên nghiệp',
                maxSelect: 1,
                features: [
                    'Website CV responsive đẹp mắt',
                    'Tên miền cá nhân miễn phí 1 năm',
                    'Hosting miễn phí'
                ]
            },
            {
                id: 'web_portfolio',
                name: 'Website ePortfolio',
                group: 'website',
                originalPrice: 2999000,
                salePrice: 1499000,
                savingText: 'Tiết kiệm 1.500k',
                tagLabel: 'Premium',
                tagStyle: 'tagBest',
                description: 'ePortfolio đầy đủ + các trang chi tiết dự án đã làm',
                maxSelect: 1,
                features: [
                    'Tất cả tính năng của Website CV',
                    'Trang chi tiết từng dự án',
                    'Gallery ảnh/video',
                    'Blog cá nhân',
                    'Tên miền cá nhân miễn phí 1 năm'
                ]
            }
        ],
        combo_rules: [
            {
                discountPercent: 20,
                requireGroups: ['photo_id', 'website'],
                label: 'Combo Ảnh thẻ + Website -20%'
            },
            {
                discountPercent: 20,
                requireGroups: ['photo_profile', 'website'],
                label: 'Combo Ảnh Profile + Website -20%'
            }
        ],
        referral_rules: {
            cashbackPercent: 20,
            codeType: 'order_number',
            description: 'Hoàn 20% giá trị đơn hàng cho người giới thiệu khi đơn mới hoàn thành. Mã giới thiệu = mã đơn hàng đã thành công của bạn.'
        }
    }

    console.log('🎯 Seeding ISME Career Fair 2026 event...')
    console.log(`   Name: ${eventData.name}`)
    console.log(`   Code: ${eventData.code}`)
    console.log(`   Services: ${eventData.services.length}`)
    console.log(`   Combo rules: ${eventData.combo_rules.length}`)
    console.log(`   Subdomains: ${eventData.subdomains.join(', ')}`)

    const { data, error } = await supabase
        .from('event_sales')
        .insert([eventData])
        .select('id, name, code')
        .single()

    if (error) {
        console.error('❌ ERROR:', error.message)
        console.error(error)
        process.exit(1)
    }

    console.log(`\n✅ Event seeded successfully!`)
    console.log(`   ID: ${data.id}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Code: ${data.code}`)
    console.log(`\n📌 Truy cập: http://localhost:3001/event-sale`)
}

main().catch(err => {
    console.error('❌ Fatal:', err)
    process.exit(1)
})
