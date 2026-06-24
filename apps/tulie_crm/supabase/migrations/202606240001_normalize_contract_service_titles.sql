-- Normalize legacy "Hợp đồng kinh tế" titles to "Hợp đồng dịch vụ"
-- for non-freelancer contracts so regenerated documents stop pulling
-- the old label back from stored records.

UPDATE public.contracts
SET title = 'Hợp đồng dịch vụ'
WHERE COALESCE(category, '') <> 'freelancer'
  AND (
    title IS NULL
    OR btrim(title) = ''
    OR title ILIKE '%hợp đồng kinh tế%'
  );

COMMENT ON MIGRATION IS 'Normalize legacy contract titles to Hợp đồng dịch vụ for service contracts';
