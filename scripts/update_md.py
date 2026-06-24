import re

with open('/Users/tungnguyen/Downloads/De an X/outputs/tom_tat/tom_tat_day_du_de_an_v114_dang_list_20260614.md', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Luật bổ sung
text = text.replace(
    'Luật Sở hữu trí tuệ 50/2005/QH11 và các luật sửa đổi 36/2009/QH12, 42/2019/QH14, 07/2022/QH15;',
    'Luật Sở hữu trí tuệ 50/2005/QH11 và các luật sửa đổi 36/2009/QH12, 42/2019/QH14, 07/2022/QH15; Luật Thư viện 46/2019/QH14; Luật Xuất bản 19/2012/QH13, sửa đổi bởi 35/2018/QH14;'
)

# 2. Nghị định, Quyết định, Thông tư
text = text.replace(
    'Nghị định 30/2020/NĐ-CP;',
    'Nghị định 30/2020/NĐ-CP; 93/2020/NĐ-CP;'
)
text = text.replace(
    'Quyết định 749/QĐ-TTg;',
    'Quyết định 749/QĐ-TTg; 206/QĐ-TTg;'
)
text = text.replace(
    '02/2022/TT-BTNMT;',
    '02/2022/TT-BTNMT; 07/2023/TT-BVHTTDL; 16/2023/TT-BVHTTDL; 12/2024/TT-BVHTTDL;'
)
text = text.replace(
    'Kế hoạch 635/KH-UBND;',
    'Kế hoạch 635/KH-UBND; Kế hoạch 1785/KH-UBND ngày 07/04/2026;'
)

# 3. Mười Dự án thành phần -> Mười một
text = text.replace('10 dự án thành phần', '11 dự án thành phần')
text = text.replace('mười dự án thành phần', 'mười một dự án thành phần')
text = text.replace('Mười dự án thành phần', 'Mười một dự án thành phần')
text = text.replace('đào tạo cho 10 dự án', 'đào tạo cho 11 dự án')
text = text.replace('14 nguồn dữ liệu từ 10 dự án.', '15 nguồn dữ liệu từ 11 dự án.')

# 4. Mục tiêu tổng quát và Lớp 1
text = text.replace(
    '- Doanh thu du lịch tăng 3-4 lần so với năm 2025.',
    '- Doanh thu du lịch tăng 3-4 lần so với năm 2025.\n  - Kho di sản tư liệu số của tỉnh được hoàn thiện với tối thiểu 3,0 triệu trang tài liệu được số hóa, toàn bộ dữ liệu thư viện của các cơ sở được hợp nhất trên một nền tảng thống nhất.'
)
text = text.replace(
    'Lớp dữ liệu cốt lõi: dữ liệu thô từ số hóa tài sản hữu hình/vô hình,',
    'Lớp dữ liệu cốt lõi: dữ liệu thô từ số hóa tài sản hữu hình, vô hình và di sản tư liệu (Hán Nôm, sắc phong, Châu bản, địa chí),'
)

# 5. Kinh phí DA5
text = text.replace('Khối A đầu tư 2026-2030: 350,482 tỷ đồng', 'Khối A đầu tư 2026-2030: 354,561 tỷ đồng')
text = text.replace('Trung ương 315,433 tỷ, địa phương 35,048 tỷ.', 'Trung ương 319,104 tỷ, địa phương 35,457 tỷ.')
text = text.replace('Khối B thường xuyên/thuê hạ tầng/vận hành 2026-2035: 167,884 tỷ đồng', 'Khối B thường xuyên/thuê hạ tầng/vận hành 2026-2035: 170,116 tỷ đồng')
text = text.replace('Nhà nước chi 145,364 tỷ, doanh thu bù đắp 22,520 tỷ.', 'Nhà nước chi 147,596 tỷ, doanh thu bù đắp 22,520 tỷ.')

# 6. Kinh phí tổng
# if any in the md file
text = text.replace('3.496,89', '3.599,66')

# 7. Add DA11 at the end of section 9
# Find the end of section 9 (which might be before section 10 if there is one, or at the end of the file)
da11_content = """
## 9.11. DA11 - Thư viện thông minh và Kho di sản tư liệu số

- Mục tiêu: số hóa 100% tài liệu cổ, quý hiếm và tài liệu Hán Nôm, sắc phong; xây Kho di sản tư liệu số (tối thiểu 1,5 triệu trang); nền tảng thư viện thông minh hợp nhất hai cơ sở; liên thông Thư viện Quốc gia.
- Hiện trạng: sáp nhập 2 thư viện (Đồng Hới, Đông Hà) thành Thư viện tỉnh Quảng Trị, có 125.500 bản sách, 180 loại báo tạp chí, 28 cán bộ.
- Kinh phí: 96,687 tỷ đồng.
- Nguồn: Ngân sách khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số (NQ 57).
"""
# insert at the end of the file since DA10 is the last section.
if '# 10.' in text:
    text = text.replace('# 10.', da11_content + '\n# 10.')
else:
    text += da11_content

# Save
with open('/Users/tungnguyen/Downloads/De an X/outputs/tom_tat/tom_tat_day_du_de_an_v123_dang_list_20260614_v2.md', 'w', encoding='utf-8') as f:
    f.write(text)
