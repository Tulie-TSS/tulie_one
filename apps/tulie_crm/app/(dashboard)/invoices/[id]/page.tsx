import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@repo/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@repo/ui'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { StatusBadge } from '@/components/shared/status-badge'
import {
    ArrowLeft,
    Edit,
    Download,
    Send,
    CreditCard,
    Building2,
    FileSignature,
    Calendar,
    CheckCircle,
    Receipt,
    Banknote
} from 'lucide-react'
import { getInvoiceById } from '@/lib/supabase/services/invoice-service'
import { notFound } from 'next/navigation'
import { InvoiceEmailButton } from '@/components/invoices/invoice-email-button'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params
    const invoice = await getInvoiceById(id)
    return {
        title: invoice ? `${invoice.invoice_number} - Tulie CRM` : 'Hóa đơn - Tulie CRM',
    }
}

export default async function InvoiceDetailPage({ params }: any) {
    const { id } = await params
    const invoice = await getInvoiceById(id)

    if (!invoice) {
        notFound()
    }

    const isPaid = invoice.status === 'paid'
    const remaining = invoice.total_amount - (invoice.paid_amount || 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/invoices">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 rounded-md bg-primary/10 flex items-center justify-center">
                            <Banknote className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="px-2 py-0.5 rounded-md border bg-muted font-medium h-6 flex items-center text-xs">
                                    {invoice.invoice_number}
                                </div>
                                <StatusBadge status={invoice.status} entityType="invoice" />
                            </div>
                            <h1 className="text-3xl leading-none">{invoice.customer?.company_name}</h1>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4" />
                        Tải PDF
                    </Button>
                    <InvoiceEmailButton
                        customerEmail={invoice.customer?.email}
                        customerName={invoice.customer?.company_name || 'Quý khách'}
                        invoiceNumber={invoice.invoice_number}
                        totalAmount={formatCurrency(invoice.total_amount)}
                        dueDate={formatDate(invoice.due_date)}
                        senderName={invoice.creator?.full_name || 'Tulie Agency'}
                    />
                    {!isPaid && (
                        <Button>
                            <CreditCard className="h-4 w-4" />
                            Ghi nhận thanh toán
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/invoices/${invoice.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Preview */}
                    <Card>
                        <CardContent className="p-8">
                            {/* Invoice Header */}
                            <div className="flex justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-10 bg-foreground rounded-lg flex items-center justify-center">
                                            <span className="text-background font-semibold">T</span>
                                        </div>
                                        <span className="text-xl font-semibold">Tulie Agency</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        123 ABC Street, District 1, HCMC<br />
                                        lienhe@tulie.vn | 098 898 4554
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-semibold">HÓA ĐƠN</h2>
                                    <p className="text-lg font-medium">{invoice.invoice_number}</p>
                                </div>
                            </div>

                            {/* Bill To */}
                            <div className="grid gap-6 sm:grid-cols-2 mb-8">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Khách hàng</p>
                                    <p className="font-semibold">{invoice.customer?.company_name}</p>
                                    <p className="text-sm">{invoice.customer?.address}</p>
                                    <p className="text-sm">MST: {invoice.customer?.tax_code || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Ngày phát hành:</span>
                                            <span>{formatDate(invoice.issue_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Hạn thanh toán:</span>
                                            <span>{formatDate(invoice.due_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border rounded-lg overflow-hidden mb-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mô tả</TableHead>
                                            <TableHead className="text-center w-20">SL</TableHead>
                                            <TableHead className="text-right w-32">Đơn giá</TableHead>
                                            <TableHead className="text-right w-32">Thành tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.items?.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <p className="font-medium">{item.name || item.description}</p>
                                                    {item.description && item.name && (
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantity} {item.unit}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {(!invoice.items || invoice.items.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có hạng mục nào</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tạm tính</span>
                                        <span>{formatCurrency(invoice.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">VAT ({invoice.vat_percent}%)</span>
                                        <span>{formatCurrency(invoice.vat_amount)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Tổng cộng</span>
                                        <span>{formatCurrency(invoice.total_amount)}</span>
                                    </div>
                                    {invoice.paid_amount > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Đã thanh toán</span>
                                                <span>{formatCurrency(invoice.paid_amount)}</span>
                                            </div>
                                            {remaining > 0 && (
                                                <div className="flex justify-between font-semibold text-destructive">
                                                    <span>Còn lại</span>
                                                    <span>{formatCurrency(remaining)}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {invoice.notes && (
                                <div className="mt-8 pt-6 border-t">
                                    <p className="text-sm text-muted-foreground">Ghi chú: {invoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {invoice.payments?.map((payment: any) => (
                                <div key={payment.id} className="flex items-center gap-4 p-4 rounded-lg border">
                                    <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                            <span className="text-sm text-muted-foreground">{formatDate(payment.payment_date)}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.payment_method} {payment.notes && `• ${payment.notes}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!invoice.payments || invoice.payments.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">Chưa có lịch sử thanh toán</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Khách hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/customers/${invoice.customer?.id}`} className="font-medium hover:underline">
                                {invoice.customer?.company_name}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{invoice.customer?.email}</p>
                        </CardContent>
                    </Card>

                    {/* Related Contract */}
                    {invoice.contract && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSignature className="h-5 w-5" />
                                    Hợp đồng liên quan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={`/contracts/${invoice.contract.id}`} className="font-medium hover:underline">
                                    {invoice.contract.contract_number}
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Thông tin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ngày tạo</span>
                                <span>{formatDate(invoice.created_at)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Người tạo</span>
                                <span>{invoice.creator?.full_name || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
