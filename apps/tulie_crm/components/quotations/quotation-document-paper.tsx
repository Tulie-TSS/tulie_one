import React from 'react';
import { formatCurrency, formatDate, readNumberToWords } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface QuotationDocumentPaperProps {
    quotation: any;
    brandConfig?: any;
    selectedItemIds?: string[];
}

export function renderStructuredNotes(text: string) {
    if (!text) return null;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    
    return (
        <div className="space-y-1 mt-1">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                
                // Numbered list item: e.g. "1. Phương thức thanh toán:"
                const mainNumMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
                if (mainNumMatch) {
                    const [, num, content] = mainNumMatch;
                    const colonIndex = content.indexOf(':');
                    if (colonIndex !== -1) {
                        const title = content.substring(0, colonIndex + 1);
                        const rest = content.substring(colonIndex + 1);
                        return (
                            <div key={i} className="text-[11px] leading-relaxed text-slate-800">
                                <span className="font-bold">{num}. {title}</span>
                                <span>{rest}</span>
                            </div>
                        );
                    }
                    return (
                        <div key={i} className="text-[11px] leading-relaxed text-slate-800 font-bold">
                            {num}. {content}
                        </div>
                    );
                }
                
                // Section header: ends with ':' or contains 'Về ' and a colon
                if (trimmed.endsWith(':') || (trimmed.startsWith('Về ') && trimmed.includes(':'))) {
                    const colonIndex = trimmed.indexOf(':');
                    const title = colonIndex !== -1 ? trimmed.substring(0, colonIndex + 1) : trimmed;
                    const rest = colonIndex !== -1 ? trimmed.substring(colonIndex + 1) : '';
                    return (
                        <div key={i} className="text-[11px] leading-relaxed text-slate-900 font-bold mt-3.5 mb-1">
                            <span>{title}</span>
                            <span className="font-normal text-slate-700">{rest}</span>
                        </div>
                    );
                }
                
                // Sub-bullet or list item: starts with "-", "•", "*"
                const bulletMatch = trimmed.match(/^[-•\*]\s*(.*)$/);
                if (bulletMatch) {
                    const [, content] = bulletMatch;
                    return (
                        <div key={i} className="flex gap-2.5 items-start pl-4 text-[11px] leading-relaxed text-slate-700">
                            <span className="shrink-0 text-slate-400 mt-1">•</span>
                            <span>{content}</span>
                        </div>
                    );
                }
                
                // Otherwise normal paragraph
                return (
                    <p key={i} className="text-[11px] leading-relaxed text-slate-700 pl-2">
                        {trimmed}
                    </p>
                );
            })}
        </div>
    );
}

export function QuotationDocumentPaper({ quotation, brandConfig, selectedItemIds }: QuotationDocumentPaperProps) {
    const rawItems = quotation.items || [];
    const items = selectedItemIds 
        ? rawItems.filter((item: any) => selectedItemIds.includes(item.id))
        : rawItems;

    // Group items by section
    const sections: Record<string, any[]> = items.reduce((acc: any, item: any) => {
        const sectionName = item.section_name || '';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(item);
        return acc;
    }, {});

    const sectionEntries = Object.entries(sections).sort((a, b) => {
        if (a[0] === '') return 1;
        if (b[0] === '') return -1;
        return (a[1][0]?.sort_order || 0) - (b[1][0]?.sort_order || 0);
    });

    const pc = quotation.proposal_content || {};
    const hasProposal = quotation.type === 'proposal' && pc;

    const proposalSections: { label: string; content: string }[] = [];
    if (hasProposal) {
        if (pc.sections && Array.isArray(pc.sections)) {
            pc.sections.forEach((s: any) => {
                if (s.label && s.content && String(s.content).trim().length > 0) {
                    proposalSections.push({ label: s.label, content: s.content });
                }
            });
        } else {
            if (pc.introduction) proposalSections.push({ label: 'Mục tiêu & Giới thiệu', content: pc.introduction });
            if (pc.scope_of_work) proposalSections.push({ label: 'Phạm vi công việc (Scope of Work)', content: pc.scope_of_work });
            if (pc.methodology) proposalSections.push({ label: 'Phương pháp & Cách tiếp cận', content: pc.methodology });
            if (pc.deliverables) proposalSections.push({ label: 'Sản phẩm bàn giao (Deliverables)', content: pc.deliverables });
            if (pc.team) proposalSections.push({ label: 'Đội ngũ chuyên trách', content: pc.team });
            if (pc.timeline) proposalSections.push({ label: 'Lộ trình triển khai (Timeline)', content: pc.timeline });
            if (pc.warranty) proposalSections.push({ label: 'Bảo hành & Hỗ trợ', content: pc.warranty });
            if (pc.why_us) proposalSections.push({ label: 'Vì sao chọn chúng tôi?', content: pc.why_us });
            if (pc.case_studies) proposalSections.push({ label: 'Case Studies & Portfolio', content: pc.case_studies });
        }
    }

    const day = new Date(quotation.created_at).getDate();
    const month = new Date(quotation.created_at).getMonth() + 1;
    const year = new Date(quotation.created_at).getFullYear();

    return (
        <>
        {/* Print style: force A4 landscape so 10 columns fit */}
        <style dangerouslySetInnerHTML={{ __html: `
            @media print {
                @page {
                    size: A4;
                    margin: 20mm 15mm 20mm 25mm;
                    @bottom-right {
                        content: "Trang " counter(page) " / " counter(pages);
                        font-family: Arial, sans-serif;
                        font-size: 10pt;
                    }
                }
                .quotation-paper-basic { width: 100% !important; max-width: none !important; padding: 0 !important; box-shadow: none !important; }
                .quotation-paper-basic table { font-size: 8pt !important; }
                .quotation-paper-basic th, .quotation-paper-basic td { padding: 3px 2px !important; }
                .quotation-paper-basic, .quotation-paper-basic * {
                    font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, "MS Gothic", sans-serif !important;
                }
            }
        `}} />
        <div className="bg-white p-[2cm] min-h-[297mm] text-black font-sans leading-normal print:p-0 quotation-paper-basic">
            {/* Header following administrative style */}
            <div className="flex gap-4 items-start mb-8 text-left">
                {/* Logo */}
                <img src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"} alt="Tulie" className="h-14 w-auto object-contain grayscale" />

                {/* Company Contact Info */}
                 <div>
                    <h3 className="text-[13px] uppercase mb-1">
                        {(brandConfig?.company_name || "Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie").toUpperCase()}
                    </h3>
                    <div className="text-[11px] space-y-0.5 font-normal">
                        <p><span className="font-semibold">Địa chỉ:</span> {brandConfig?.address || "Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam"}</p>
                        <p><span className="font-semibold">MST:</span> {brandConfig?.tax_code || "0110163102"}</p>
                        <p><span className="font-semibold">Hotline:</span> {brandConfig?.phone || "098.898.4554"} - <span className="font-semibold">Email:</span> {brandConfig?.email || "hi@tulie.vn"}</p>
                        <p><span className="font-semibold">Website:</span> {brandConfig?.website || "tulie.vn"}</p>
                    </div>
                </div>
            </div>

            {/* Document Meta */}
            <div className="flex justify-between items-center mb-10 mt-6 text-[11px] font-medium">
                <div>
                    <span className="font-bold">Số:</span> #{quotation.quotation_number}
                </div>
                <div>
                    Hà Nội, ngày {day} tháng {month} năm {year}
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-10">
                <h1 className="text-[24px] uppercase">Báo giá dịch vụ</h1>
                <p className="text-[12px] mt-1 font-medium">(V/v: Cung cấp giải pháp {quotation.title || 'Marketing & Công nghệ'})</p>
            </div>

            {/* Receiver Section */}
            <div className="mb-8 space-y-3">
                <p className="font-bold text-[13px]">Kính gửi: <span className="uppercase">{quotation.customer?.company_name || quotation.customer?.full_name || quotation.customer?.name}</span></p>
                <div className="grid grid-cols-1 gap-2 text-[12px] ml-4 font-medium">
                    <p><span className="inline-block w-32">Người đại diện:</span> {quotation.customer?.representative || quotation.customer?.full_name || '................................'}</p>
                    <p><span className="inline-block w-32">Địa chỉ:</span> {quotation.customer?.address || '................................'}</p>
                    <p><span className="inline-block w-32">Số điện thoại:</span> {quotation.customer?.phone || '................................'}</p>
                    <p><span className="inline-block w-32">Email:</span> {quotation.customer?.email || '................................'}</p>
                </div>
            </div>

            <p className="text-[12px] mb-6 indent-8 font-medium">
                Lời đầu tiên, <span className="font-bold">{brandConfig?.brand_name || "Công ty Công nghệ Tulie"}</span> xin gửi tới Quý đối tác lời chào trân trọng và lời chúc sức khỏe. Căn cứ vào nhu cầu của Quý khách, chúng tôi xin gửi tới Quý khách {hasProposal && proposalSections.length > 0 ? "đề xuất giải pháp và bảng báo giá chi tiết" : "bảng báo giá chi tiết"} như sau:
            </p>

            {/* Proposal sections */}
            {hasProposal && proposalSections.length > 0 && (
                <div className="mb-8 space-y-4" style={{ pageBreakInside: 'avoid' }}>
                    <h3 className="text-[14px] uppercase font-bold border-b-2 border-black pb-1.5 mb-3">
                        I. Đề xuất giải pháp & Kế hoạch (Proposal)
                    </h3>
                    <div className="space-y-4 ml-4">
                        {proposalSections.map((section, idx) => (
                            <div key={idx} className="text-[11px] leading-relaxed" style={{ pageBreakInside: 'avoid' }}>
                                <h4 className="font-bold text-[12px] text-slate-900 mb-1">
                                    {idx + 1}. {section.label}
                                </h4>
                                <div className="pl-4 whitespace-pre-line text-slate-700">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasProposal && proposalSections.length > 0 && (
                <h3 className="text-[14px] uppercase font-bold border-b-2 border-black pb-1.5 mb-4 mt-8" style={{ pageBreakInside: 'avoid' }}>
                    II. Bảng báo giá chi tiết & Kế hoạch đầu tư (Pricing & Investment Plan)
                </h3>
            )}

            {/* Main Items Table — flexible widths, nowrap on numbers */}
            <table className="w-full border-collapse border border-black text-[11px] mb-8" style={{ tableLayout: 'auto' }}>
                <thead>
                    <tr className="bg-muted grayscale">
                        <th className="border border-black py-2 px-1 text-center text-[10px] whitespace-nowrap">STT<br /><span className="text-[7pt] font-normal opacity-60">No.</span></th>
                        <th className="border border-black py-2 px-3 text-left uppercase text-[10px]" style={{ width: '100%' }}>
                            Hạng mục & Mô tả chi tiết <br />
                            <span className="text-[7pt] font-normal opacity-60 normal-case">Items & Description</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-center text-[10px] whitespace-nowrap">
                            ĐVT <br />
                            <span className="text-[7pt] font-normal opacity-60">Unit</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-center text-[10px] whitespace-nowrap">
                            SL <br />
                            <span className="text-[7pt] font-normal opacity-60">Qty</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-right text-[10px] whitespace-nowrap">
                            Đơn giá <br />
                            <span className="text-[7pt] font-normal opacity-60">Unit Price</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-center text-[9px] whitespace-nowrap">
                            CK(%) <br />
                            <span className="text-[7pt] font-normal opacity-60">Disc.</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-right text-[9px] whitespace-nowrap">
                            Giảm giá <br />
                            <span className="text-[7pt] font-normal opacity-60">Discount</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-right text-[10px] whitespace-nowrap">
                            Thành tiền <br />
                            <span className="text-[7pt] font-normal opacity-60">Amount</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-center text-[9px] whitespace-nowrap">
                            VAT<br />(%)
                        </th>
                        <th className="border border-black py-2 px-1 text-right text-[9px] whitespace-nowrap">
                            Tiền VAT <br />
                            <span className="text-[7pt] font-normal opacity-60">VAT Amt</span>
                        </th>
                        <th className="border border-black py-2 px-1 text-right text-[10px] whitespace-nowrap">
                            Tổng cộng <br />
                            <span className="text-[7pt] font-normal opacity-60">Total</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sectionEntries.map(([sectionName, sectionItems], sIdx) => (
                        <React.Fragment key={sectionName || sIdx}>
                            {sectionName && (
                                <tr className="bg-muted">
                                    <td colSpan={11} className="border border-black py-1.5 px-3 font-bold text-[10px]">
                                        {sectionName}
                                    </td>
                                </tr>
                            )}
                            {sectionItems.map((item: any, iIdx: number) => {
                                const qty = item.quantity || 1;
                                const unitPrice = item.unit_price || 0;
                                const grossTotal = qty * unitPrice;
                                const discountPct = item.discount || 0;
                                const discountAmt = grossTotal * (discountPct / 100);
                                const afterDiscount = grossTotal - discountAmt;
                                const vatRate = item.vat_percent || quotation.vat_percent || 0;
                                const vatAmt = afterDiscount * (vatRate / 100);
                                const afterVat = afterDiscount + vatAmt;
                                return (
                                <tr key={item.id} className="font-medium">
                                    <td className="border border-black py-2 px-1 text-center align-top text-[10px] whitespace-nowrap">{sectionName ? `${sIdx + 1}.${iIdx + 1}` : iIdx + 1}</td>
                                    <td className="border border-black py-2 px-3 align-top">
                                        <p className="font-bold mb-1">{item.name || item.product_name}</p>
                                        {(item.description) && <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-relaxed mt-1 pt-1 border-t border-dashed border-border">{item.description}</p>}
                                    </td>
                                    <td className="border border-black py-2 px-1 text-center align-top whitespace-nowrap">{item.unit || 'Bộ'}</td>
                                    <td className="border border-black py-2 px-1 text-center align-top whitespace-nowrap">{qty}</td>
                                    <td className="border border-black py-2 px-1 text-right align-top tabular-nums text-[10px] whitespace-nowrap">{formatCurrency(unitPrice).replace('₫', '')}</td>
                                    <td className="border border-black py-2 px-1 text-center align-top text-[10px] whitespace-nowrap">{discountPct > 0 ? `${discountPct}%` : '-'}</td>
                                    <td className="border border-black py-2 px-1 text-right align-top tabular-nums text-[10px] whitespace-nowrap">{discountAmt > 0 ? formatCurrency(discountAmt).replace('₫', '') : '-'}</td>
                                    <td className="border border-black py-2 px-1 text-right align-top tabular-nums text-[10px] whitespace-nowrap">{formatCurrency(afterDiscount).replace('₫', '')}</td>
                                    <td className="border border-black py-2 px-1 text-center align-top text-[10px] whitespace-nowrap">{vatRate > 0 ? `${vatRate}%` : (quotation.vat_exempt_status === 'exempt' ? 'KCT' : '0%')}</td>
                                    <td className="border border-black py-2 px-1 text-right align-top tabular-nums text-[10px] whitespace-nowrap">{vatAmt > 0 ? formatCurrency(vatAmt).replace('₫', '') : (quotation.vat_exempt_status === 'exempt' ? 'KCT' : '0')}</td>
                                    <td className="border border-black py-2 px-1 text-right align-top tabular-nums text-[10px] whitespace-nowrap">{formatCurrency(afterVat).replace('₫', '')}</td>
                                </tr>
                                );
                            })}
                        </React.Fragment>
                    ))}
                    {/* Summary Rows */}
                    {(() => {
                        const allItems = sectionEntries.flatMap(([, sItems]) => sItems);
                        const grossTotal = allItems.reduce((sum: number, item: any) => sum + (item.quantity || 1) * (item.unit_price || 0), 0);
                        const totalDiscountAmt = allItems.reduce((sum: number, item: any) => {
                            const g = (item.quantity || 1) * (item.unit_price || 0);
                            return sum + g * ((item.discount || 0) / 100);
                        }, 0);
                        const subtotalAfterDiscount = grossTotal - totalDiscountAmt;
                        const totalVatAmt = allItems.reduce((sum: number, item: any) => {
                            const g = (item.quantity || 1) * (item.unit_price || 0);
                            const d = g * ((item.discount || 0) / 100);
                            const net = g - d;
                            return sum + net * ((item.vat_percent || quotation.vat_percent || 0) / 100);
                        }, 0);
                        const grandTotal = subtotalAfterDiscount + totalVatAmt;
                        const displayTotal = selectedItemIds ? grandTotal : (quotation.total_amount || grandTotal);
                        return (
                            <>
                                <tr>
                                    <td colSpan={10} className="border border-black py-2 px-3 text-right text-[10px]">Tạm tính / Subtotal:</td>
                                    <td className="border border-black py-2 px-1 text-right tabular-nums text-[10px] whitespace-nowrap">{formatCurrency(grossTotal).replace('₫', '')}</td>
                                </tr>
                                {totalDiscountAmt > 0 && (
                                    <tr>
                                        <td colSpan={10} className="border border-black py-2 px-3 text-right text-[10px] text-muted-foreground">Tổng chiết khấu / Total Discount:</td>
                                        <td className="border border-black py-2 px-1 text-right tabular-nums text-[10px] text-muted-foreground whitespace-nowrap">-{formatCurrency(totalDiscountAmt).replace('₫', '')}</td>
                                    </tr>
                                )}
                                {totalDiscountAmt > 0 && (
                                    <tr>
                                        <td colSpan={10} className="border border-black py-2 px-3 text-right text-[10px]">Cộng tiền hàng / Net Amount:</td>
                                        <td className="border border-black py-2 px-1 text-right tabular-nums text-[10px] whitespace-nowrap">{formatCurrency(subtotalAfterDiscount).replace('₫', '')}</td>
                                    </tr>
                                )}
                                {(() => {
                                    // Calculate VAT breakdown
                                    const vatGroups = allItems.reduce((acc: Record<number, number>, item) => {
                                        const qty = item.quantity || 1;
                                        const price = item.unit_price || 0;
                                        const disc = item.discount || 0;
                                        const rate = item.vat_percent || quotation.vat_percent || 0;
                                        const net = (qty * price) * (1 - disc / 100);
                                        const vatAmt = net * (rate / 100);
                                        acc[rate] = (acc[rate] || 0) + vatAmt;
                                        return acc;
                                    }, {});

                                    const sortedRates = Object.keys(vatGroups).map(Number).sort((a, b) => a - b);

                                    return sortedRates.map(rate => (
                                        <tr key={rate}>
                                            <td colSpan={10} className="border border-black py-2 px-3 text-right font-medium text-[10px]">
                                                {rate === 0 && quotation.vat_exempt_status === 'exempt' ? 'Không chịu thuế GTGT:' : `Tổng thuế suất GTGT (VAT) ${rate}%:`}
                                            </td>
                                            <td className="border border-black py-2 px-1 text-right tabular-nums text-[10px] whitespace-nowrap font-bold">
                                                {rate === 0 && quotation.vat_exempt_status === 'exempt' ? 'KCT' : formatCurrency(vatGroups[rate]).replace('₫', '')}
                                            </td>
                                        </tr>
                                    ));
                                })()}
                                <tr className="bg-muted">
                                    <td colSpan={10} className="border border-black py-3 px-3 text-right uppercase text-[11px] font-bold">Tổng cộng thanh toán / Grand Total:</td>
                                    <td colSpan={1} className="border border-black py-3 px-1 text-right text-[13px] tabular-nums whitespace-nowrap font-bold">{formatCurrency(displayTotal).replace('₫', '')} VND</td>
                                </tr>
                                <tr>
                                    <td colSpan={11} className="border border-black py-3 px-3 text-[11px] font-medium">
                                        <span className="font-bold underline uppercase mr-1">Bằng chữ:</span> 
                                        <span className="first-letter:uppercase">{readNumberToWords(displayTotal)}</span>
                                    </td>
                                </tr>
                            </>
                        );
                    })()}
                </tbody>
            </table>

            {/* Terms & Conditions / Notes */}
            <div className="mb-8 space-y-4">
                <h4 className="text-[13px] uppercase underline">Điều khoản & Ghi chú (Terms & Conditions):</h4>
                <div className="grid grid-cols-1 gap-1.5 text-[11px] ml-4 font-medium leading-relaxed">
                    {(() => {
                        const pc = quotation.proposal_content || {};
                        return (
                            <>
                                {pc.payment_terms?.installments ? (
                                    <>
                                        <p><span className="font-bold border-b border-black">Tiến độ thanh toán:</span></p>
                                        <div className="ml-2 mb-2">
                                            {pc.payment_terms.installments.map((inst: any, i: number) => (
                                                <p key={i}>- <span className="font-bold">Đợt {inst.phase} ({inst.percent}%):</span> {inst.description}</p>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {renderStructuredNotes(quotation.terms || brandConfig?.default_payment_terms || `1. Phương thức thanh toán: Chuyển khoản hoặc Tiền mặt.
2. Thời gian thực hiện: Theo thỏa thuận chi tiết trong phụ lục hợp đồng.`)}
                                    </>
                                )}
                                
                                {pc.notes && Array.isArray(pc.notes) ? (
                                    <>
                                        <p><span className="font-bold border-b border-black">Ghi chú bổ sung:</span></p>
                                        <div className="ml-2">
                                            {pc.notes.map((note: string, i: number) => (
                                                <p key={i}>- {note}</p>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {renderStructuredNotes(quotation.notes || brandConfig?.default_notes || `3. Hiệu lực báo giá: Trong vòng 30 ngày kể từ ngày ban hành văn bản này.`)}
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Banking Info Section */}
            <div className="mb-12 p-5 border border-black bg-muted grayscale">
                <h4 className="text-[13px] uppercase underline mb-4">Thông tin chuyển khoản (Payment Information):</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-[12px] ml-4 font-medium">
                    <div className="space-y-2 md:col-span-3">
                        <p><span className="font-bold">Chủ tài khoản:</span> <span className="uppercase">{quotation.bank_account_name || brandConfig?.bank_account_name || 'CÔNG TY TNHH TULIE'}</span></p>
                        <p><span className="font-bold">Số tài khoản:</span> <span className="text-[14px]">{quotation.bank_account_no || brandConfig?.bank_account_no || '0110163102'}</span></p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <p><span className="font-bold">Ngân hàng:</span> {quotation.bank_name || brandConfig?.bank_name || 'MB BANK'}</p>
                        <p><span className="font-bold">Chi nhánh:</span> {quotation.bank_branch || brandConfig?.bank_branch || 'SỞ GIAO DỊCH'}</p>
                    </div>
                </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-2 gap-10 mt-12 text-center text-[12px]">
                <div className="space-y-1">
                    <p className="font-bold uppercase text-foreground">Đại diện khách hàng</p>
                    <p className="italic text-[10px] text-muted-foreground">(Ký & ghi rõ họ tên / Customer Signature)</p>
                    <div className="h-24"></div>
                    <div className="h-px w-32 bg-muted mx-auto" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold uppercase text-foreground">Đại diện {brandConfig?.brand_name || "Công ty Tulie"}</p>

                    <p className="italic text-[10px] text-muted-foreground">(Ký & đóng dấu / Authorized Signature)</p>
                    <div className="h-28 flex items-center justify-center opacity-10 grayscale">
                        <img src={brandConfig?.logo_url || "/file/tulie-agency-logo.png"} alt="Seal" className="h-16 w-auto" />
                    </div>
                </div>
            </div>

            {/* Footer Contact */}
            <div className="mt-auto pt-8 border-t border-border text-center text-[9px] text-muted-foreground">
                {brandConfig?.brand_name || "Tulie Agency"} - Creative Solution & Digital Strategy | Hotline: {brandConfig?.phone || "098.898.4554"} | Website: {brandConfig?.website || "tulie.vn"}
            </div>
        </div>
        </>
    );
}
