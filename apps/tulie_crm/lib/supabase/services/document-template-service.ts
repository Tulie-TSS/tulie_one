'use server'
import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { DocumentTemplate, DocumentBundle, GeneratedDocument } from '@/types'
import { readNumberToWords } from '@/lib/utils/format'

// Parse date string to local Date, avoiding UTC timezone shift
// "2024-03-16T17:00:00+00:00" -> local March 16 (not UTC which may differ)
function parseLocalDateString(dateStr: string): Date {
      const datePart = dateStr.substring(0, 10) // "2024-03-16"
  const [y, m, d] = datePart.split('-').map(Number)
      return new Date(y, m - 1, d)
}

import { contractTemplate } from './contract-template'
import { paymentTemplate } from './payment-template'
import { orderTemplate } from './order-template'
import { deliveryMinutesTemplate } from './delivery-minutes-template'
import { quotationTemplate } from './quotation-template'

/**
     * Standard templates with common variables for HTML fallback and variable definition
     * Variables map to {{variable_name}} placeholders in HTML templates
     */
const defaultTemplates: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
            name: 'Bao gia (Mau chuan)',
            type: 'quotation',
            content: quotationTemplate,
            variables: [
                      'quotation_number', 'quotation_date', 'day', 'month', 'year',
                      'customer_company', 'customer_representative', 'customer_position',
                      'customer_address', 'customer_phone', 'customer_mobile',
                      'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                      'quotation_items_table', 'subtotal', 'vat_rate', 'vat_amount',
                      'total_amount_number', 'amount_in_words',
                      'payment_terms', 'delivery_time', 'delivery_address'
                    ]
    },
    {
            name: 'Hop dong (Mau chuan)',
            type: 'contract',
            content: contractTemplate,
            variables: [
                      'contract_number', 'contract_date', 'day', 'month', 'year',
                      'customer_company', 'customer_representative', 'customer_position',
                      'customer_address', 'customer_phone', 'customer_mobile',
                      'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                      'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
                      'total_amount_number', 'amount_in_words',
                      'payment_milestones'
                    ]
    },
    {
            name: 'Chung tu thanh toan (Mau chuan)',
            type: 'payment',
            content: paymentTemplate,
            variables: [
                      'payment_number', 'payment_date', 'day', 'month', 'year',
                      'customer_company', 'customer_representative', 'customer_position',
                      'customer_address', 'customer_phone', 'customer_mobile',
                      'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                      'payment_amount_number', 'amount_in_words', 'payment_method', 'reason'
                    ]
    },
    {
            name: 'Don hang (Mau chuan)',
            type: 'order',
            content: orderTemplate,
            variables: [
                      'order_number', 'order_date', 'day', 'month', 'year',
                      'customer_company', 'customer_representative', 'customer_position',
                      'customer_address', 'customer_phone', 'customer_mobile',
                      'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                      'order_items_table', 'subtotal', 'vat_rate', 'vat_amount',
                      'total_amount_number', 'amount_in_words',
                      'delivery_date', 'delivery_location'
                    ]
    },
    {
            name: 'Bien ban ban giao (Mau chuan)',
            type: 'delivery_minutes',
            content: deliveryMinutesTemplate,
            variables: [
                      'minutes_number', 'minutes_date', 'day', 'month', 'year',
                      'customer_company', 'customer_representative', 'customer_position',
                      'customer_address', 'customer_phone', 'customer_mobile',
                      'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                      'delivery_items_table', 'received_by', 'delivered_by'
                    ]
    }
    ]
;

/**
 * Initialize standard templates in the database if they don't exist
 */
export async function seedDocumentTemplates() {
      const supabase = createAdminClient()

  for (const template of defaultTemplates) {
          const { data: existing } = await supabase
            .from('document_templates')
            .select('id')
            .eq('type', template.type)
            .maybeSingle()

        if (!existing) {
                  const { error } = await supabase
                    .from('document_templates')
                    .insert(template)

            if (error) {
                        console.error(`Error seeding template ${template.name}:`, error)
            } else {
                        console.log(`Successfully seeded template: ${template.name}`)
            }
        }
  }
}

/**
 * Get a template by type
 */
export async function getDocumentTemplateByType(type: string) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('type', type)
        .maybeSingle()

  if (error) {
          console.error('Error fetching template:', error)
          return null
  }

  // If not found in DB, return the default one
  if (!data) {
          return defaultTemplates.find(t => t.type === type) || null
  }

  return data as DocumentTemplate
}

/**
 * Generate a document from a bundle
 */
export async function generateDocument(bundle: DocumentBundle): Promise<GeneratedDocument | null> {
      // Implementation for PDF/HTML generation would go here
  // For now, return a placeholder
  return {
          id: 'placeholder',
          bundle_id: bundle.id,
          content: 'Generated content will appear here',
          file_path: null,
          created_at: new Date().toISOString()
  }
}
