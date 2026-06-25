'use server'
import { createClient } from '../server'
import { PnLData, PnLMonthly, CashFlowMonth, ExpenseSummary } from '@/types'

/**
 * Finance Service — Tính toán P&L và Cash Flow từ dữ liệu hiện có
 *
 * Nguồn dữ liệu:
 * - payment_transactions (SePay): Dòng tiền thực tế vào/ra
 * - invoices (output): Doanh thu B2B
 * - invoices (input): COGS — hóa đơn đầu vào
 * - retail_orders: Doanh thu B2C
 * - contracts (freelancer): COGS — chi phí CTV khoán việc
 * - expenses: Chi phí vận hành (OpEx)
 */

// ─── P&L Report ───

export async function getFinancePnL(period: 'month' | 'quarter' | 'year' = 'year'): Promise<PnLData> {
    const supabase = await createClient()
    const now = new Date()

    let startDate: Date
    if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'quarter') {
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    } else {
        startDate = new Date(now.getFullYear(), 0, 1)
    }
    const startStr = startDate.toISOString()

    // ── Revenue ──
    // SePay matched inbound transactions
    const { data: sepayIn } = await supabase
        .from('payment_transactions')
        .select('amount_in, matched_invoice_id, matched_order_id')
        .eq('transfer_type', 'in')
        .gte('transaction_date', startStr)

    const matchedSepay = sepayIn?.filter(tx => tx.matched_invoice_id || tx.matched_order_id) || []
    const matchedInvIds = new Set(matchedSepay.filter(tx => tx.matched_invoice_id).map(tx => tx.matched_invoice_id!))
    const matchedOrdIds = new Set(matchedSepay.filter(tx => tx.matched_order_id).map(tx => tx.matched_order_id!))

    const sepayB2B = matchedSepay.filter(tx => tx.matched_invoice_id).reduce((s, tx) => s + (Number(tx.amount_in) || 0), 0)
    const sepayB2C = matchedSepay.filter(tx => !tx.matched_invoice_id && tx.matched_order_id).reduce((s, tx) => s + (Number(tx.amount_in) || 0), 0)

    // Unmatched invoices (output)
    const { data: outputInvoices } = await supabase
        .from('invoices')
        .select('id, paid_amount')
        .eq('type', 'output')
        .gte('issue_date', startStr)

    const unmatchedInvRevenue = outputInvoices?.filter(i => !matchedInvIds.has(i.id)).reduce((s, i) => s + (i.paid_amount || 0), 0) || 0

    // Unmatched retail orders
    const { data: retailOrders } = await supabase
        .from('retail_orders')
        .select('id, paid_amount')
        .neq('order_status', 'cancelled')
        .gte('created_at', startStr)

    const unmatchedRetailRevenue = retailOrders?.filter(o => !matchedOrdIds.has(o.id)).reduce((s, o) => s + (o.paid_amount || 0), 0) || 0

    const revenue_b2b = sepayB2B + unmatchedInvRevenue
    const revenue_b2c = sepayB2C + unmatchedRetailRevenue
    const revenue = revenue_b2b + revenue_b2c

    // ── COGS ──
    // 1. CTV freelancer contracts — paid amounts
    const { data: ctvContracts } = await supabase
        .from('contracts')
        .select('total_amount, status')
        .eq('category', 'freelancer')
        .in('status', ['active', 'completed'])
        .gte('created_at', startStr)

    const cogs_ctv = ctvContracts?.reduce((s, c) => s + (c.total_amount || 0), 0) || 0

    // 2. Input invoices (purchases)
    const { data: inputInvoices } = await supabase
        .from('invoices')
        .select('paid_amount')
        .eq('type', 'input')
        .gte('issue_date', startStr)

    const cogs_input_invoices = inputInvoices?.reduce((s, i) => s + (i.paid_amount || 0), 0) || 0

    const cogs = cogs_ctv + cogs_input_invoices

    // ── Gross Profit ──
    const gross_profit = revenue - cogs

    // ── OpEx ──
    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', startStr)

    const opex = expenses?.reduce((s, e) => s + (e.amount || 0), 0) || 0

    // ── Net Profit ──
    const net_profit = gross_profit - opex

    return {
        revenue,
        revenue_b2b,
        revenue_b2c,
        cogs,
        cogs_ctv,
        cogs_input_invoices,
        gross_profit,
        opex,
        net_profit,
        gross_margin: revenue > 0 ? (gross_profit / revenue) * 100 : 0,
        net_margin: revenue > 0 ? (net_profit / revenue) * 100 : 0,
    }
}

// ─── P&L Monthly Breakdown ───

export async function getPnLMonthly(months: number = 12): Promise<PnLMonthly[]> {
    const supabase = await createClient()
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
    const startStr = startDate.toISOString()

    // Fetch all data for the period
    const [sepayRes, outInvRes, retOrdRes, ctvRes, inInvRes, expRes] = await Promise.all([
        supabase.from('payment_transactions')
            .select('amount_in, transfer_type, transaction_date, matched_invoice_id, matched_order_id')
            .gte('transaction_date', startStr),
        supabase.from('invoices')
            .select('id, paid_amount, issue_date')
            .eq('type', 'output')
            .gte('issue_date', startStr),
        supabase.from('retail_orders')
            .select('id, paid_amount, created_at')
            .neq('order_status', 'cancelled')
            .gte('created_at', startStr),
        supabase.from('contracts')
            .select('total_amount, created_at')
            .eq('category', 'freelancer')
            .in('status', ['active', 'completed'])
            .gte('created_at', startStr),
        supabase.from('invoices')
            .select('paid_amount, issue_date')
            .eq('type', 'input')
            .gte('issue_date', startStr),
        supabase.from('expenses')
            .select('amount, date')
            .gte('date', startStr),
    ])

    const sepayTxns = sepayRes.data || []
    const outputInvoices = outInvRes.data || []
    const retailOrders = retOrdRes.data || []
    const ctvContracts = ctvRes.data || []
    const inputInvoices = inInvRes.data || []
    const expenses = expRes.data || []

    // Build matched sets
    const matchedInvIds = new Set(sepayTxns.filter(tx => tx.matched_invoice_id).map(tx => tx.matched_invoice_id!))
    const matchedOrdIds = new Set(sepayTxns.filter(tx => tx.matched_order_id).map(tx => tx.matched_order_id!))

    const isMonth = (dateStr: string | null, targetMonth: Date) => {
        if (!dateStr) return false
        const dt = new Date(dateStr)
        return dt.getMonth() === targetMonth.getMonth() && dt.getFullYear() === targetMonth.getFullYear()
    }

    const result: PnLMonthly[] = []
    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
        const label = `T${d.getMonth() + 1}`

        // Revenue
        const sepayIn = sepayTxns.filter(tx =>
            isMonth(tx.transaction_date, d) && tx.transfer_type === 'in'
            && (tx.matched_invoice_id || tx.matched_order_id)
        )
        const sepayRev = sepayIn.reduce((s, tx) => s + (Number(tx.amount_in) || 0), 0)
        const unmatchedInv = outputInvoices.filter(i => isMonth(i.issue_date, d) && !matchedInvIds.has(i.id))
            .reduce((s, i) => s + (i.paid_amount || 0), 0)
        const unmatchedRetail = retailOrders.filter(o => isMonth(o.created_at, d) && !matchedOrdIds.has(o.id))
            .reduce((s, o) => s + (o.paid_amount || 0), 0)
        const monthRevenue = sepayRev + unmatchedInv + unmatchedRetail

        // COGS
        const monthCtv = ctvContracts.filter(c => isMonth(c.created_at, d))
            .reduce((s, c) => s + (c.total_amount || 0), 0)
        const monthInputInv = inputInvoices.filter(i => isMonth(i.issue_date, d))
            .reduce((s, i) => s + (i.paid_amount || 0), 0)
        const monthCogs = monthCtv + monthInputInv

        // OpEx
        const monthOpex = expenses.filter(e => isMonth(e.date, d))
            .reduce((s, e) => s + (e.amount || 0), 0)

        const grossProfit = monthRevenue - monthCogs
        const netProfit = grossProfit - monthOpex

        result.push({
            date: label,
            revenue: monthRevenue / 1000000,
            cogs: monthCogs / 1000000,
            gross_profit: grossProfit / 1000000,
            opex: monthOpex / 1000000,
            net_profit: netProfit / 1000000,
        })
    }

    return result
}

// ─── Cash Flow ───

export async function getCashFlowData(months: number = 12): Promise<CashFlowMonth[]> {
    const supabase = await createClient()
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)
    const startStr = startDate.toISOString()

    // SePay transactions (all, not just matched)
    const { data: sepayTxns } = await supabase
        .from('payment_transactions')
        .select('amount_in, amount_out, transfer_type, transaction_date')
        .gte('transaction_date', startStr)

    // Manual expenses
    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', startStr)

    const isMonth = (dateStr: string | null, targetMonth: Date) => {
        if (!dateStr) return false
        const dt = new Date(dateStr)
        return dt.getMonth() === targetMonth.getMonth() && dt.getFullYear() === targetMonth.getFullYear()
    }

    const result: CashFlowMonth[] = []
    let cumulative = 0

    for (let i = 0; i < months; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
        const label = `T${d.getMonth() + 1}`

        const inflow = (sepayTxns || [])
            .filter(tx => isMonth(tx.transaction_date, d) && tx.transfer_type === 'in')
            .reduce((s, tx) => s + (Number(tx.amount_in) || 0), 0)

        const sepayOut = (sepayTxns || [])
            .filter(tx => isMonth(tx.transaction_date, d) && tx.transfer_type === 'out')
            .reduce((s, tx) => s + (Number(tx.amount_out) || 0), 0)

        const manualExp = (expenses || [])
            .filter(e => isMonth(e.date, d))
            .reduce((s, e) => s + (e.amount || 0), 0)

        const outflow = sepayOut + manualExp
        const net = inflow - outflow
        cumulative += net

        result.push({
            date: label,
            inflow: inflow / 1000000,
            outflow: outflow / 1000000,
            net: net / 1000000,
            cumulative: cumulative / 1000000,
        })
    }

    return result
}

// ─── Expense Breakdown ───

export async function getExpenseBreakdown(period: 'month' | 'quarter' | 'year' = 'year'): Promise<ExpenseSummary[]> {
    const supabase = await createClient()
    const now = new Date()

    let startDate: Date
    if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'quarter') {
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
    } else {
        startDate = new Date(now.getFullYear(), 0, 1)
    }

    const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category, description')
        .gte('date', startDate.toISOString())

    if (!expenses || expenses.length === 0) return []

    // Group by category (fallback to "Khác" if no category)
    const groups: Record<string, { amount: number; count: number }> = {}
    for (const exp of expenses) {
        const cat = exp.category || 'Khác'
        if (!groups[cat]) groups[cat] = { amount: 0, count: 0 }
        groups[cat].amount += exp.amount || 0
        groups[cat].count += 1
    }

    const total = Object.values(groups).reduce((s, g) => s + g.amount, 0)

    return Object.entries(groups)
        .map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: total > 0 ? (data.amount / total) * 100 : 0,
            count: data.count,
        }))
        .sort((a, b) => b.amount - a.amount)
}

// ─── Recent Transactions ───

export async function getRecentTransactions(limit: number = 20) {
    const supabase = await createClient()

    const { data: txns } = await supabase
        .from('payment_transactions')
        .select('id, amount_in, amount_out, transfer_type, transaction_date, content, code, matched_invoice_id, matched_order_id')
        .order('transaction_date', { ascending: false })
        .limit(limit)

    return txns || []
}
