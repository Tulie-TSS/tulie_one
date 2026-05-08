import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { RetailOrder } from '@/types';

// Register a font that supports Vietnamese
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
    fontWeight: 'medium',
});
Font.register({
    family: 'Roboto-Bold',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
    fontWeight: 'bold',
});
Font.register({
    family: 'Roboto-Regular',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    fontWeight: 'normal',
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Roboto-Regular',
        fontSize: 9,
        color: '#333',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'Roboto-Bold',
    },
    col1: { width: '5%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#bfbfbf', padding: 4 }, // STT
    col2: { width: '15%', borderRightWidth: 1, borderRightColor: '#bfbfbf', padding: 4 }, // Mã đơn
    col3: { width: '15%', borderRightWidth: 1, borderRightColor: '#bfbfbf', padding: 4 }, // Học sinh
    col4: { width: '10%', borderRightWidth: 1, borderRightColor: '#bfbfbf', padding: 4 }, // SĐT
    col5: { width: '20%', borderRightWidth: 1, borderRightColor: '#bfbfbf', padding: 4 }, // Lớp/Địa chỉ
    col6: { width: '25%', borderRightWidth: 1, borderRightColor: '#bfbfbf', padding: 4 }, // Vỉ ảnh/Sản phẩm
    col7: { width: '10%', padding: 4 }, // Ghi chú

    headerText: {
        fontSize: 9,
        fontFamily: 'Roboto-Bold',
    },
    cellText: {
        fontSize: 8,
    }
});

interface OrderExportPdfProps {
    orders: RetailOrder[];
    title?: string;
}

const OrderExportPdf: React.FC<OrderExportPdfProps> = ({ orders, title = 'DANH SÁCH ĐƠN HÀNG STUDIO CHI TIẾT' }) => {
    return (
        <Document title={title}>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.title}>{title}</Text>
                
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={styles.col1}><Text style={styles.headerText}>STT</Text></View>
                        <View style={styles.col2}><Text style={styles.headerText}>Mã đơn</Text></View>
                        <View style={styles.col3}><Text style={styles.headerText}>Học sinh</Text></View>
                        <View style={styles.col4}><Text style={styles.headerText}>SĐT</Text></View>
                        <View style={styles.col5}><Text style={styles.headerText}>Lớp / Địa chỉ</Text></View>
                        <View style={styles.col6}><Text style={styles.headerText}>Vỉ ảnh / Sản phẩm</Text></View>
                        <View style={styles.col7}><Text style={styles.headerText}>Ghi chú</Text></View>
                    </View>

                    {/* Table Rows */}
                    {orders.map((order, index) => {
                        const itemsText = order.items?.map(item => `${item.product_name} (x${item.quantity})`).join(', ') || '---';
                        
                        // Try to build a descriptive address/class info
                        const classInfo = [
                            order.metadata?.class_name,
                            order.metadata?.grade,
                            order.metadata?.school_name
                        ].filter(Boolean).join(' - ');

                        const shippingAddress = order.shipping_info?.address;
                        const address = classInfo 
                            ? (shippingAddress ? `${classInfo} (${shippingAddress})` : classInfo)
                            : (shippingAddress || order.metadata?.address || '---');
                        
                        return (
                            <View key={order.id} style={styles.tableRow} wrap={false}>
                                <View style={styles.col1}><Text style={styles.cellText}>{index + 1}</Text></View>
                                <View style={styles.col2}><Text style={styles.cellText}>{order.order_number}</Text></View>
                                <View style={styles.col3}><Text style={styles.cellText}>{order.customer_name}</Text></View>
                                <View style={styles.col4}><Text style={styles.cellText}>{order.customer_phone || '---'}</Text></View>
                                <View style={styles.col5}><Text style={styles.cellText}>{address}</Text></View>
                                <View style={styles.col6}><Text style={styles.cellText}>{itemsText}</Text></View>
                                <View style={styles.col7}><Text style={styles.cellText}>{order.notes || '---'}</Text></View>
                            </View>
                        );
                    })}
                </View>

                {/* Footer */}
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 8, color: '#666' }}>Ngày xuất: {new Date().toLocaleString('vi-VN')}</Text>
                    <Text style={{ fontSize: 8, color: '#666' }}>Tổng số đơn: {orders.length}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default OrderExportPdf;
