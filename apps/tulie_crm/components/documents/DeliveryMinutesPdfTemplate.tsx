import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { docStyles as styles } from './document-styles';
import { formatCurrency } from '@/lib/utils/format';

interface DeliveryMinutesPdfTemplateProps {
    data: any;
}

const DeliveryMinutesPdfTemplate: React.FC<DeliveryMinutesPdfTemplateProps> = ({ data }) => {
    const {
        minutes_number = '......./BBGN-TL',
        contract_number = '................',
        contract_date = '................',
        day = new Date().getDate(),
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
        customer = {},
        items = [],
    } = data;

    return (
        <Document title={`Bien_ban_ban_giao_${minutes_number}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.companyHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.companyName, { fontSize: 8 }]}>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</Text>
                        <View style={{ marginTop: 5, fontSize: 8 }}>
                            <Text>MST: 0110163102</Text>
                            <Text>Hotline: 098.898.4554</Text>
                        </View>
                    </View>
                    <View style={[styles.headerRight, { alignItems: 'center' }]}>
                        <View style={{ width: 80, height: 40, marginBottom: 5 }}>
                            <Image src="/file/tulie-agency-logo.png" style={{ objectFit: 'contain' }} />
                        </View>
                        <Text style={[styles.companyName, { fontSize: 12 }]}>TULIE AGENCY</Text>
                        <View style={[styles.underline, { width: '60%' }]} />
                    </View>
                </View>

                <View style={styles.docMeta}>
                    <Text style={styles.docNumber}>Số: {minutes_number}</Text>
                    <Text style={styles.docDate}>Hà Nội, ngày {day} tháng {month} năm {year}</Text>
                </View>

                <Text style={styles.title}>Biên bản giao nhận và nghiệm thu</Text>

                <View style={styles.lawSection}>
                    <Text style={styles.lawItem}>- Căn cứ Hợp đồng số {contract_number} ký ngày {contract_date}.</Text>
                </View>

                <Text style={[styles.text, { marginBottom: 10 }]}>
                    Hôm nay, ngày {day} tháng {month} năm {year}, chúng tôi gồm có:
                </Text>

                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên nhận (Bên A): {customer.company_name || customer.name || '................'}</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>{customer.representative || '................'}</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>{customer.position || '................'}</Text>
                    </View>
                </View>

                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên giao (Bên B): Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>Ông Nguyễn Thanh Tùng</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>Giám đốc</Text>
                    </View>
                </View>

                <Text style={[styles.text, { marginTop: 15 }]}>Hai bên thống nhất nghiệm thu và bàn giao các hạng mục công việc sau:</Text>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }, styles.bold]}>STT</Text>
                        <Text style={[styles.tableCell, { width: '60%' }, styles.bold]}>Nội dung công việc/Sản phẩm</Text>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '15%' }, styles.bold]}>ĐVT</Text>
                        <Text style={[styles.tableCellLast, styles.colCenter, { width: '15%' }, styles.bold]}>Số lượng</Text>
                    </View>
                    {items.map((item: any, idx: number) => (
                        <View style={styles.tableRow} key={idx} wrap={false}>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }]}>{idx + 1}</Text>
                            <Text style={[styles.tableCell, { width: '60%' }]}>{item.product_name || item.name}</Text>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '15%' }]}>{item.unit || 'Bộ'}</Text>
                            <Text style={[styles.tableCellLast, styles.colCenter, { width: '15%' }]}>{item.quantity}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ marginTop: 12 }}>
                    <Text style={[styles.bold, { textDecoration: 'underline', marginBottom: 4 }]}>Điều khoản và Quy định nghiệm thu:</Text>
                    <Text style={[styles.text, { fontSize: 8, marginBottom: 3 }]}>
                        1. <Text style={styles.bold}>Xác nhận hoàn thành:</Text> Hai bên thống nhất nghiệm thu các hạng mục nêu trên. Kể từ thời điểm ký biên bản này, Bên B được xác nhận đã hoàn thành đầy đủ, đúng hạn và đúng chất lượng toàn bộ nghĩa vụ theo Hợp đồng và Phụ lục (trừ các lỗi nhỏ được ghi nhận tại Phụ lục đính kèm nếu có).
                    </Text>
                    <Text style={[styles.text, { fontSize: 8, marginBottom: 3 }]}>
                        2. <Text style={styles.bold}>Yêu cầu phát sinh:</Text> Mọi yêu cầu điều chỉnh, bổ sung tính năng, giao diện hoặc cấu trúc hệ thống phát sinh sau ngày ký biên bản này đều được tính là dịch vụ phát sinh ngoài Hợp đồng và sẽ được hai bên thỏa thuận chi phí riêng.
                    </Text>
                    <Text style={[styles.text, { fontSize: 8, marginBottom: 3 }]}>
                        3. <Text style={styles.bold}>Nghĩa vụ thanh toán:</Text> Biên bản này là căn cứ đề nghị thanh toán. Bên A có nghĩa vụ thanh toán đợt cuối số tiền còn lại cho Bên B trong thời hạn tối đa 07 (bảy) ngày làm việc kể từ ngày ký biên bản này.
                    </Text>
                    <Text style={[styles.text, { fontSize: 8, marginBottom: 3 }]}>
                        4. <Text style={styles.bold}>Chậm thanh toán & Tạm ngưng dịch vụ:</Text> Nếu Bên A chậm thanh toán quá thời hạn nêu trên, Bên B có quyền tính lãi chậm trả 15%/năm và có quyền tạm dừng dịch vụ bảo hành, bảo trì, hỗ trợ kỹ thuật hoặc ngưng vận hành hệ thống cho đến khi Bên A hoàn tất nghĩa vụ thanh toán.
                    </Text>
                </View>

                <Text style={[styles.text, { marginTop: 10, fontSize: 8 }]}>
                    Biên bản bàn giao và nghiệm thu được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.
                </Text>

                <View style={styles.signatureSection} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên A</Text>
                        <Text>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>{customer.representative || ''}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên B</Text>
                        <Text>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>Ông Nguyễn Thanh Tùng</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default DeliveryMinutesPdfTemplate;
