'use server'

import { createClient } from '../server'
import { revalidatePath } from 'next/cache'

export async function getExpenses() {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false })

        if (error) {
            console.error('Error fetching expenses:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Fatal error in getExpenses:', err)
        return []
    }
}

export async function createExpense(expense: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Clean up input fields
        const payload = {
            title: expense.title || null,
            description: expense.description || null,
            amount: Number(expense.amount),
            date: expense.date || new Date().toISOString().split('T')[0],
            category: expense.category,
            payment_method: expense.payment_method || null,
            created_by: user?.id || null
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert([payload])
            .select()
            .single()

        if (error) {
            console.error('Error creating expense:', error)
            throw error
        }

        revalidatePath('/finance')
        return data
    } catch (err: any) {
        console.error('Fatal error in createExpense:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi tạo chi phí')
    }
}

export async function updateExpense(id: string, expense: any) {
    try {
        const supabase = await createClient()
        
        // Clean up input fields
        const payload = {
            title: expense.title || null,
            description: expense.description || null,
            amount: Number(expense.amount),
            date: expense.date || new Date().toISOString().split('T')[0],
            category: expense.category,
            payment_method: expense.payment_method || null
        }

        const { data, error } = await supabase
            .from('expenses')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating expense:', error)
            throw error
        }

        revalidatePath('/finance')
        return data
    } catch (err: any) {
        console.error('Fatal error in updateExpense:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi cập nhật chi phí')
    }
}

export async function deleteExpense(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting expense:', error)
            throw error
        }

        revalidatePath('/finance')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteExpense:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa chi phí')
    }
}

export async function deleteExpenses(ids: string[]) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('expenses')
            .delete()
            .in('id', ids)

        if (error) {
            console.error('Error deleting expenses:', error)
            throw error
        }

        revalidatePath('/finance')
        return true
    } catch (err: any) {
        console.error('Fatal error in deleteExpenses:', err)
        throw new Error(err.message || 'Lỗi hệ thống khi xóa nhiều chi phí')
    }
}
