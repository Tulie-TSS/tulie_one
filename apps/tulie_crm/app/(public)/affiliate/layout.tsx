import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Chương trình Đối tác Kinh doanh | Tulie Agency',
    description: 'Trở thành Đối tác phát triển kinh doanh của Tulie — hoa hồng lên đến 20%, thưởng tiền mặt đến 20 triệu/tháng. Không cần vốn, không giới hạn thu nhập.',
    openGraph: {
        title: 'Chương trình Đối tác Kinh doanh | Tulie Agency',
        description: 'Hoa hồng lên đến 20% + thưởng tiền mặt đến 20 triệu/tháng. Giới thiệu khách hàng — Tulie lo phần còn lại.',
        url: 'https://crm.tulie.app/affiliate',
        siteName: 'Tulie Agency',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chương trình Đối tác Kinh doanh | Tulie Agency',
        description: 'Hoa hồng lên đến 20% + thưởng tiền mặt đến 20 triệu/tháng. Giới thiệu khách hàng — Tulie lo phần còn lại.',
    },
}

export default function AffiliateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
