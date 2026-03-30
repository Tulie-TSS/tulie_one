import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Chương trình Đối tác Kinh doanh | Tulie Agency',
    description: 'Trở thành Đối tác kinh doanh dịch vụ thiết kế Website & Landing Page — hoa hồng lên đến 28%, thưởng tiền mặt cộng dồn đến 48 triệu. Không cần vốn, không giới hạn thu nhập.',
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/icon.png',
    },
    openGraph: {
        title: 'Kiếm đến 28% hoa hồng + 48 triệu thưởng | Đối tác Tulie',
        description: 'Giới thiệu khách hàng thiết kế Website & Landing Page — hoa hồng lên đến 28% + thưởng tiền mặt cộng dồn. Đăng ký miễn phí, thu nhập không giới hạn.',
        url: 'https://hoptac.tulie.agency',
        siteName: 'Tulie Agency',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Kiếm đến 28% hoa hồng + 48 triệu thưởng | Đối tác Tulie',
        description: 'Giới thiệu khách hàng thiết kế Website & Landing Page — hoa hồng lên đến 28% + thưởng tiền mặt cộng dồn. Đăng ký miễn phí.',
    },
}

export default function AffiliateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
