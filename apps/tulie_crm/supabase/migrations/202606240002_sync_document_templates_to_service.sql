-- Sync legacy contract template rows to the new service-contract naming.
-- This keeps the database itself aligned with the runtime normalization.

UPDATE public.document_templates
SET name = 'Hợp đồng dịch vụ (Mẫu chuẩn)',
    updated_at = now()
WHERE type = 'contract'
  AND name ILIKE '%hợp đồng kinh tế%';

UPDATE public.document_templates
SET content = replace(content, 'HỢP ĐỒNG KINH TẾ', 'HỢP ĐỒNG DỊCH VỤ'),
    updated_at = now()
WHERE type = 'contract'
  AND content ILIKE '%HỢP ĐỒNG KINH TẾ%';

UPDATE public.document_templates
SET content = replace(content, 'Hợp đồng kinh tế', 'Hợp đồng dịch vụ'),
    updated_at = now()
WHERE type = 'contract'
  AND content ILIKE '%Hợp đồng kinh tế%';
