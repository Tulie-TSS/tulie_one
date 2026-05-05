'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronRight, ChevronLeft, User, CreditCard, FileCheck, Loader2, AlertCircle, Eye, ExternalLink } from 'lucide-react'

interface ContractInfo {
    title: string
    contract_number: string
    total_amount: number
    start_date: string | null
    end_date: string | null
}

interface FreelancerInfo {
    name: string
    cccd: string
    cccd_date: string
    cccd_place: string
    dob: string
    address: string
    contact_address: string
    phone: string
    email: string
    bank_account: string
    bank_name: string
}

interface Props {
    token: string
    contract: ContractInfo
    initialData: FreelancerInfo
    isAlreadySubmitted: boolean
}

const STEPS = [
    { id: 1, label: 'Thông tin cá nhân', icon: User },
    { id: 2, label: 'Ngân hàng & Liên hệ', icon: CreditCard },
    { id: 3, label: 'Xác nhận & Gửi', icon: FileCheck },
]

const BANKS = [
    'Vietcombank', 'VietinBank', 'BIDV', 'Techcombank', 'MB Bank',
    'ACB', 'VPBank', 'TPBank', 'Sacombank', 'SHB', 'HDBank',
    'OCB', 'SeABank', 'Agribank', 'MSB', 'LienVietPostBank',
    'VIB', 'Nam A Bank', 'Eximbank', 'BacABank', 'Khác',
]

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    try {
        return new Date(dateStr).toLocaleDateString('vi-VN')
    } catch { return dateStr }
}

export default function CtvForm({ token, contract, initialData, isAlreadySubmitted }: Props) {
    const [step, setStep] = useState(isAlreadySubmitted ? 3 : 1)
    const [submitted, setSubmitted] = useState(isAlreadySubmitted)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState<FreelancerInfo>(initialData)

    const set = (field: keyof FreelancerInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }))
        setError('')
    }

    const validateStep1 = () => {
        if (!form.name.trim()) return 'Vui lòng nhập họ tên đầy đủ'
        if (!form.cccd.trim() || form.cccd.length < 9) return 'Số CCCD/CMND không hợp lệ (9-12 chữ số)'
        if (!form.cccd_date) return 'Vui lòng nhập ngày cấp CCCD'
        if (!form.cccd_place.trim()) return 'Vui lòng nhập nơi cấp CCCD'
        if (!form.dob) return 'Vui lòng nhập ngày sinh'
        if (!form.address.trim()) return 'Vui lòng nhập địa chỉ thường trú'
        return null
    }

    const validateStep2 = () => {
        if (!form.phone.trim() || form.phone.length < 9) return 'Số điện thoại không hợp lệ'
        if (!form.email.trim() || !form.email.includes('@')) return 'Email không hợp lệ'
        if (!form.bank_account.trim()) return 'Vui lòng nhập số tài khoản ngân hàng'
        if (!form.bank_name.trim()) return 'Vui lòng chọn ngân hàng'
        return null
    }

    const goNext = () => {
        if (step === 1) {
            const err = validateStep1()
            if (err) { setError(err); return }
        }
        if (step === 2) {
            const err = validateStep2()
            if (err) { setError(err); return }
        }
        setError('')
        setStep(s => s + 1)
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/ctv/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Có lỗi xảy ra')
            setSubmitted(true)
            setStep(3)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-start py-8 px-4">
            {/* Header */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <img src="/file/tulie-agency-logo.png" alt="Tulie Agency" className="h-8 w-auto object-contain brightness-0 invert" />
                    <div className="h-5 w-px bg-white/20" />
                    <span className="text-white/60 text-sm font-medium">Hợp đồng Cộng tác viên</span>
                </div>

                {/* Contract Summary Card */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
                                {contract.contract_number || 'Hợp đồng đang chờ ký kết'}
                            </p>
                            <h1 className="text-white font-semibold text-lg leading-tight">{contract.title}</h1>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-white/50 text-xs mb-1">Giá trị</p>
                            <p className="text-blue-300 font-bold text-lg">
                                {formatCurrency(contract.total_amount)}
                            </p>
                        </div>
                    </div>
                    {(contract.start_date || contract.end_date) && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex gap-6 text-sm">
                            {contract.start_date && (
                                <span className="text-white/50">Bắt đầu: <span className="text-white/80">{formatDate(contract.start_date)}</span></span>
                            )}
                            {contract.end_date && (
                                <span className="text-white/50">Kết thúc: <span className="text-white/80">{formatDate(contract.end_date)}</span></span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Step Indicator */}
            <div className="w-full max-w-2xl mb-6">
                <div className="flex items-center gap-0">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center flex-1">
                            <div className={`flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                                    step > s.id ? 'bg-green-500 text-white' :
                                    step === s.id ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                                    'bg-white/10 text-white/40'
                                }`}>
                                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                                </div>
                                <span className={`text-xs font-medium hidden sm:block transition-colors ${step >= s.id ? 'text-white' : 'text-white/30'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-3 transition-colors ${step > s.id ? 'bg-green-500' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* === STEP 1: Personal Info === */}
                    {step === 1 && (
                        <div>
                            <div className="bg-slate-50 border-b px-6 py-4">
                                <h2 className="font-semibold text-slate-800 text-lg">Thông tin cá nhân</h2>
                                <p className="text-slate-500 text-sm mt-0.5">Điền chính xác như trên CCCD/CMND của bạn</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <Field label="Họ và tên đầy đủ *" hint="Đúng như trên giấy tờ tuỳ thân">
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={set('name')}
                                        placeholder="Nguyễn Văn A"
                                        className={inputCls}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Ngày sinh *">
                                        <input type="date" value={form.dob} onChange={set('dob')} className={inputCls} />
                                    </Field>
                                    <Field label="Số CCCD / CMND *">
                                        <input
                                            type="text"
                                            value={form.cccd}
                                            onChange={set('cccd')}
                                            placeholder="001234567890"
                                            maxLength={12}
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Ngày cấp *">
                                        <input type="date" value={form.cccd_date} onChange={set('cccd_date')} className={inputCls} />
                                    </Field>
                                    <Field label="Nơi cấp *">
                                        <input
                                            type="text"
                                            value={form.cccd_place}
                                            onChange={set('cccd_place')}
                                            placeholder="Cục Cảnh sát QLHC về TTXH"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <Field label="Địa chỉ thường trú *" hint="Địa chỉ ghi trong CCCD">
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={set('address')}
                                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        className={inputCls}
                                    />
                                </Field>

                                <Field label="Địa chỉ liên hệ" hint="Để trống nếu giống thường trú">
                                    <input
                                        type="text"
                                        value={form.contact_address}
                                        onChange={set('contact_address')}
                                        placeholder="Địa chỉ hiện tại (nếu khác thường trú)"
                                        className={inputCls}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* === STEP 2: Bank & Contact === */}
                    {step === 2 && (
                        <div>
                            <div className="bg-slate-50 border-b px-6 py-4">
                                <h2 className="font-semibold text-slate-800 text-lg">Ngân hàng & Liên hệ</h2>
                                <p className="text-slate-500 text-sm mt-0.5">Thông tin để thanh toán thù lao và liên lạc</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Số điện thoại *">
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={set('phone')}
                                            placeholder="0901234567"
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Email *">
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={set('email')}
                                            placeholder="ten@email.com"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                                    <p className="text-blue-700 text-sm font-medium mb-1">💳 Thông tin tài khoản nhận thù lao</p>
                                    <p className="text-blue-600 text-xs">Tulie sẽ chuyển khoản thanh toán vào tài khoản này theo đúng lịch trình hợp đồng.</p>
                                </div>

                                <Field label="Tên ngân hàng *">
                                    <select value={form.bank_name} onChange={set('bank_name')} className={inputCls}>
                                        <option value="">— Chọn ngân hàng —</option>
                                        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </Field>

                                <Field label="Số tài khoản *" hint="Số tài khoản ngân hàng, không phải số thẻ">
                                    <input
                                        type="text"
                                        value={form.bank_account}
                                        onChange={set('bank_account')}
                                        placeholder="Ví dụ: 1234567890123"
                                        className={inputCls}
                                    />
                                </Field>

                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                                    <p className="font-medium mb-1">⚠️ Lưu ý về thuế thu nhập cá nhân</p>
                                    <p className="text-amber-700 text-xs leading-relaxed">
                                        Theo quy định hiện hành, Tulie Agency sẽ khấu trừ <strong>10% thuế TNCN</strong> trên tổng thù lao trước khi thanh toán và thay mặt bạn nộp lên cơ quan thuế. Bạn có thể yêu cầu chứng từ khấu trừ thuế sau khi hợp đồng hoàn thành.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === STEP 3: Review & Confirm === */}
                    {step === 3 && (
                        <div>
                            {submitted ? (
                                // Success State
                                <div className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-9 h-9 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Đã gửi thành công!</h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Thông tin của bạn đã được lưu. Tulie sẽ liên hệ xác nhận và gửi hợp đồng chính thức để ký kết.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-5 text-left space-y-3 mt-2">
                                        <InfoRow label="Họ tên" value={form.name} />
                                        <InfoRow label="CCCD/CMND" value={form.cccd} />
                                        <InfoRow label="Điện thoại" value={form.phone} />
                                        <InfoRow label="Email" value={form.email} />
                                        <InfoRow label="Ngân hàng" value={form.bank_name} />
                                        <InfoRow label="Số TK" value={form.bank_account} />
                                    </div>

                                    <div className="pt-2 flex flex-col gap-3">
                                        <a
                                            href={`/api/contracts/${token}/preview?type=freelance_contract`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-5 py-3 text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem trước hợp đồng
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        <button
                                            onClick={() => { setSubmitted(false); setStep(1) }}
                                            className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
                                        >
                                            Cập nhật thông tin
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Review before submit
                                <div>
                                    <div className="bg-slate-50 border-b px-6 py-4">
                                        <h2 className="font-semibold text-slate-800 text-lg">Xác nhận thông tin</h2>
                                        <p className="text-slate-500 text-sm mt-0.5">Kiểm tra lại trước khi gửi — thông tin sẽ được dùng trong hợp đồng</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <ReviewSection title="Thông tin cá nhân">
                                            <InfoRow label="Họ tên" value={form.name} />
                                            <InfoRow label="Ngày sinh" value={form.dob} />
                                            <InfoRow label="CCCD/CMND" value={form.cccd} />
                                            <InfoRow label="Ngày cấp" value={form.cccd_date} />
                                            <InfoRow label="Nơi cấp" value={form.cccd_place} />
                                            <InfoRow label="Địa chỉ thường trú" value={form.address} />
                                            {form.contact_address && <InfoRow label="Địa chỉ liên hệ" value={form.contact_address} />}
                                        </ReviewSection>

                                        <ReviewSection title="Liên hệ & Ngân hàng">
                                            <InfoRow label="Điện thoại" value={form.phone} />
                                            <InfoRow label="Email" value={form.email} />
                                            <InfoRow label="Ngân hàng" value={form.bank_name} />
                                            <InfoRow label="Số tài khoản" value={form.bank_account} />
                                        </ReviewSection>

                                        <div className="bg-slate-50 rounded-xl border p-4 text-sm text-slate-600">
                                            Bằng cách nhấn <strong>Gửi xác nhận</strong>, bạn xác nhận rằng thông tin trên là chính xác và đồng ý sử dụng trong hợp đồng cộng tác viên với Tulie Agency.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mx-6 mb-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    {!submitted && (
                        <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t pt-5 mt-2">
                            {step > 1 ? (
                                <button
                                    onClick={() => { setStep(s => s - 1); setError('') }}
                                    className="inline-flex items-center gap-2 text-slate-500 text-sm hover:text-slate-800 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Quay lại
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button
                                    onClick={goNext}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Tiếp theo
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 bg-green-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi...</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4" />Gửi xác nhận</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-white/30 text-xs mt-6 pb-4">
                    Thông tin được bảo mật và chỉ dùng cho mục đích hợp đồng — Tulie Agency
                </p>
            </div>
        </div>
    )
}

// ─── Helpers ──────────────────────────────────────────────

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            {hint && <p className="text-xs text-slate-400 -mt-0.5">{hint}</p>}
            {children}
        </div>
    )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-white overflow-hidden">
            <div className="bg-slate-50 border-b px-4 py-2.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
            </div>
            <div className="p-4 divide-y divide-slate-100">{children}</div>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
            <span className="text-slate-400 text-sm w-36 shrink-0">{label}</span>
            <span className="text-slate-800 text-sm font-medium">{value || '—'}</span>
        </div>
    )
}
