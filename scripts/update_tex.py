import re

with open('/Users/tungnguyen/Downloads/De an X/latex_sources/Bao_cao_tong_hop_ky_thuat_cong_nghe_DeAn_CDS_VHTTDL_QuangTri_v13.tex', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace numbers
text = text.replace('3.496,89 tỷ', '3.599,66 tỷ')
text = text.replace('3.496,89', '3.599,66')
text = text.replace('3.405,877', '3.506,643')
text = text.replace('350,482', '354,561')
text = text.replace('167,884', '170,116')
text = text.replace('91,016', '93,016')
text = text.replace('67,590', '69,590')
text = text.replace('67.590.400.000', '69.590.400.000')

# 10 to 11 DA
text = text.replace('10 dự án thành phần', '11 dự án thành phần')
text = text.replace('Mười dự án thành phần', 'Mười một dự án thành phần')
text = text.replace('mười dự án thành phần', 'mười một dự án thành phần')
text = text.replace('10 DA =', '11 DA =')
text = text.replace('vào 10 dự án', 'vào 11 dự án')
text = text.replace('10 hệ thống rời rạc', '11 hệ thống rời rạc')
text = text.replace('cho 10 dự án', 'cho 11 dự án')

# Update title and text to reflect v123/v14
text = text.replace('v114', 'v123')
# Also update the versions in the text where v13 is mentioned to v14 if needed, but the user said "vào bản v13 Bao_cao_tong_hop...pdf", so keeping it as v13 or v14 doesn't matter much as long as the numbers are updated. I will keep it as v13 but update the numbers. Or I can rename to v14. Let's keep it as v13 or rename to v14 if we save to a new file.

# Fix the phrase "10 nhóm công nghệ" if that meant something else, no, "10 nhóm" was a count of tech groups.

with open('/Users/tungnguyen/Downloads/De an X/latex_sources/Bao_cao_tong_hop_ky_thuat_cong_nghe_DeAn_CDS_VHTTDL_QuangTri_v13_updated.tex', 'w', encoding='utf-8') as f:
    f.write(text)
