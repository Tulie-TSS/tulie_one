/**
 * Utility functions for cleaning up HTML formatting, table column alignments,
 * and borders in generated contract documents.
 */

export function cleanContractSummaryTableBorders(html: string): string {
    if (!html) return html
    let clean = html

    // Helper to extract text from a <tr> row, ignoring HTML tags
    const extractTdTexts = (trHtml: string): string[] => {
        const tdMatches = trHtml.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || []
        return tdMatches.map(td => {
            return td.replace(/<[^>]+>/g, '').trim()
        }).filter(Boolean)
    }

    // Helper to find money number (e.g. 32.800.000) from text array
    const extractMoneyValue = (texts: string[]): string => {
        for (const txt of texts) {
            const m = txt.match(/[\d]{1,3}(?:\.[\d]{3})+/)?.[0]
            if (m) return m
            if ((txt.includes('000') || txt.includes('VNĐ') || txt.includes('VND')) && /\d/.test(txt)) {
                const nums = txt.replace(/[^\d.]/g, '')
                if (nums) return nums
            }
        }
        return ''
    }

    // 1. Replace any <tr> block containing "Cộng tiền hàng"
    clean = clean.replace(
        /<tr[^>]*>(?:(?!<\/tr>)[\s\S])*?Cộng tiền hàng[\s\S]*?<\/tr>/gi,
        (match) => {
            const texts = extractTdTexts(match)
            const valTexts = texts.filter(t => !t.toLowerCase().includes('cộng tiền hàng'))
            let val = extractMoneyValue(valTexts)
            if (!val) {
                const m = match.match(/[\d]{1,3}(?:\.[\d]{3})+/)
                if (m) val = m[0]
            }
            return `<tr style="background:#f9f9f9;">
                <td style="border:1px solid #000; padding:6px 8px; text-align:left; font-weight:normal;" colspan="8">Cộng tiền hàng (chưa VAT):</td>
                <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold; white-space:nowrap;">${val}</td>
            </tr>`
        }
    )

    // 2. Replace any <tr> block containing "Thuế suất GTGT" or "Thuế GTGT"
    clean = clean.replace(
        /<tr[^>]*>(?:(?!<\/tr>)[\s\S])*?Thuế suất GTGT[\s\S]*?<\/tr>/gi,
        (match) => {
            let vatVal = 'Không chịu thuế'
            if (match.includes('Không chịu thuế') || match.includes('KCT') || match.includes('không chịu thuế')) {
                vatVal = 'Không chịu thuế'
            } else {
                const texts = extractTdTexts(match).filter(t => !t.toLowerCase().includes('thuế'))
                vatVal = extractMoneyValue(texts) || 'Không chịu thuế'
            }
            return `<tr style="background:#f9f9f9;">
                <td style="border:1px solid #000; padding:6px 8px; text-align:left; font-weight:normal;" colspan="8">Thuế suất GTGT (VAT):</td>
                <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold; white-space:nowrap;">${vatVal}</td>
            </tr>`
        }
    )

    // 3. Replace any <tr> block containing "Tổng cộng thanh toán"
    clean = clean.replace(
        /<tr[^>]*>(?:(?!<\/tr>)[\s\S])*?Tổng cộng thanh toán[\s\S]*?<\/tr>/gi,
        (match) => {
            const texts = extractTdTexts(match).filter(t => !t.toLowerCase().includes('tổng cộng thanh toán'))
            let val = extractMoneyValue(texts)
            if (!val) {
                const m = match.match(/[\d]{1,3}(?:\.[\d]{3})+/)
                if (m) val = m[0]
            }
            return `<tr style="background:#e8e8e8;">
                <td style="border:1px solid #000; padding:8px; text-align:left; font-weight:bold; font-size:10pt;" colspan="8">Tổng cộng thanh toán:</td>
                <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt; white-space:nowrap;">${val ? val + ' VND' : ''}</td>
            </tr>`
        }
    )

    // 4. Strip ALL bold font weight from Clause 7.2 line and 7.2 number cell
    clean = clean
        .replace(
            /(<td[^>]*style=")([^"]*)(">\s*7\.2\.\s*<\/td>)/gi,
            (m, p1, style, p3) => `${p1}${style.replace(/font-weight:\s*bold;?/gi, '')}${p3}`
        )
        .replace(
            /(7\.2\.\s*<\/td>\s*<td[^>]*style=")([^"]*)(">[^<]*Bảo mật thông tin và dữ liệu cá nhân)/gi,
            (m, p1, style, p3) => `${p1}${style.replace(/font-weight:\s*bold;?/gi, '')}${p3}`
        )
        .replace(
            /(7\.2\.\s*<\/td>\s*<td[^>]*>)\s*<strong>\s*(Bảo mật thông tin và dữ liệu cá nhân[\s\S]*?)<\/strong>/gi,
            '$1$2'
        )

    return clean
}
