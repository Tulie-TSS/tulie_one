/**
 * Hợp đồng kinh tế - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie (Google Sheets export)
 * Biến tự động: {{variable_name}}
 */
export const contractTemplate = `
<div style="font-family: Arial, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'MS Gothic', sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; line-height: 1.5; text-align: justify;">
  <!-- Header: 2 cột căn thẳng hàng -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 0;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:top; padding:0;">
        CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP<br>
        <span style="text-decoration:underline;">CÔNG NGHỆ TULIE</span>
      </td>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:top; padding:0;">
        CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
        <span style="font-weight:bold; text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</span>
      </td>
    </tr>
  </table>

  <!-- Số HĐ và ngày -->
  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{contract_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Tiêu đề -->
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">{{contract_title_upper}}</p>

  <!-- Căn cứ pháp luật - IN NGHIÊNG -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự số 91/2015/QH13 có hiệu lực từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thương mại số 36/2005/QH11 có hiệu lực từ ngày 01/01/2006 và các văn bản hướng dẫn thi hành;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Doanh nghiệp số 59/2020/QH14 có hiệu lực từ ngày 01/01/2021;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ nhu cầu sử dụng dịch vụ của Bên A và khả năng cung cấp dịch vụ của Bên B;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào sự thỏa thuận của hai bên.</p>

  <p style="margin:10px 0;">Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, chúng tôi gồm:</p>

  <!-- ===== BÊN A + BÊN B (cùng 1 bảng để căn thẳng lề) ===== -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;" cellpadding="2">
    <colgroup>
      <col style="width:160px">
      <col style="width:auto">
      <col style="width:70px">
      <col style="width:auto">
    </colgroup>

    <!-- BÊN A -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên sử dụng dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">{{customer_company}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">{{customer_representative}}</td>
      <td style="vertical-align:top; white-space:nowrap;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{customer_position}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">{{customer_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;">{{customer_phone}}</td>
      <td style="vertical-align:top;">Di động:</td>
      <td style="vertical-align:top;">{{customer_mobile}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">{{customer_tax_code}}</td>
      <td style="vertical-align:top;">Email:</td>
      <td style="vertical-align:top;">{{customer_email}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">{{customer_bank_account}}</td>
      <td style="vertical-align:top;">tại</td>
      <td style="vertical-align:top;">{{customer_bank_name}}</td>
    </tr>

    <!-- Spacer -->
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>

    <!-- BÊN B -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên cung cấp dịch vụ (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">Ông Nguyễn Thanh Tùng</td>
      <td style="vertical-align:top; white-space:nowrap;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">Giám đốc</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;"></td>
      <td style="vertical-align:top;">Di động:</td>
      <td style="vertical-align:top;">+84 98 898 4554</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">0110163102</td>
      <td style="vertical-align:top;">Email:</td>
      <td style="vertical-align:top;">info@tulie.vn</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">86683979</td>
      <td style="vertical-align:top;">tại</td>
      <td style="vertical-align:top;">Ngân hàng Techcombank - CN Hội sở</td>
    </tr>
  </table>

  <p style="margin:15px 0;">Hai bên thống nhất ký kết {{contract_title_body}} với các điều khoản sau:</p>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">1</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 1. NỘI DUNG VÀ PHẠM VI DỊCH VỤ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cung cấp cho Bên A dịch vụ thiết kế giao diện, lập trình Frontend, Backend, xây dựng hệ thống quản trị nội dung (CMS), tối ưu SEO, triển khai đa ngôn ngữ, chuyển dữ liệu và bàn giao website cho Bên A{{product_service_declaration}} theo nội dung chi tiết tại: <strong>Phụ lục 01</strong> – Bảng báo giá chi tiết; <strong>Phụ lục 02</strong> – Đề xuất giải pháp và phạm vi công việc (Scope of Work).</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phạm vi công việc, phương pháp triển khai, sản phẩm bàn giao, tiêu chí kỹ thuật, lộ trình thực hiện được quy định cụ thể tại Phụ lục 01 và Phụ lục 02, là bộ phận không tách rời của Hợp đồng này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B có trách nhiệm thực hiện dịch vụ theo đúng phạm vi công việc đã thỏa thuận. Mọi yêu cầu bổ sung, thay đổi ngoài phạm vi quy định tại các Phụ lục sẽ được xem là phát sinh (Change Request) và được xử lý theo Điều 6 của Hợp đồng này.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 2. GIÁ TRỊ HỢP ĐỒNG, TIẾN ĐỘ VÀ PHƯƠNG THỨC THANH TOÁN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Giá trị hợp đồng:</strong><br>
        Tổng giá trị Hợp đồng: <strong>{{total_amount_number}} VNĐ</strong><br>
        (Bằng chữ: <em>{{amount_in_words}}</em>).<br>
        Giá trên không chịu thuế GTGT theo quy định hiện hành (KCT).
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tiến độ thanh toán:</strong><br>
        {{payment_terms}}
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Phương thức thanh toán:</strong><br>
        2.3.1. Bên A thanh toán cho Bên B bằng chuyển khoản vào tài khoản sau:<br>
        <div style="margin-left: 20px; margin-top: 4px; line-height: 1.6;">
          - Tên tài khoản: <strong>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</strong><br>
          - Số tài khoản: <strong>86683979</strong><br>
          - Ngân hàng: <strong>TMCP Kỹ Thương Việt Nam (Techcombank) – Trung tâm giao dịch Hội Sở</strong>
        </div>
        2.3.2. Ngày thanh toán được xác định là ngày tiền được ghi Có vào tài khoản của Bên B.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Chậm thanh toán:</strong> Nếu Bên A chậm thanh toán bất kỳ khoản nào quá 05 (năm) ngày làm việc so với hạn thanh toán, Bên A phải chịu lãi chậm trả với mức 0.05%/ngày (không vượt quá lãi suất theo quy định pháp luật) tính trên số tiền chậm trả và số ngày chậm trả, nhưng tổng mức phạt và lãi chậm trả không vượt quá 8% giá trị phần nghĩa vụ thanh toán bị vi phạm, phù hợp Điều 301 Luật Thương mại 2005. Nếu Bên A chậm thanh toán quá 15 (mười lăm) ngày làm việc, Bên B có quyền tạm dừng thực hiện công việc cho đến khi Bên B nhận đủ khoản thanh toán tương ứng; thời hạn thực hiện hợp đồng sẽ được kéo dài tương ứng mà Bên B không bị coi là chậm tiến độ.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 3. THỜI GIAN THỰC HIỆN, NGHIỆM THU VÀ BÀN GIAO</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Thời gian thực hiện:</strong> Tổng thời gian thực hiện dự kiến: {{delivery_time}} kể từ ngày Hợp đồng có hiệu lực và Bên B nhận được thanh toán Đợt 1 (hoặc từ ngày khởi động dự án theo Biên bản khởi động, nếu có). Lộ trình chi tiết theo Phụ lục 02.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Bản dùng thử (Demo giao diện):</strong><br>
        3.2.1. Bản dùng thử là phiên bản giao diện website được Bên B lập trình demo (HTML/CSS/JS hoặc trên môi trường staging) cho các page templates theo Phụ lục 02, đảm bảo hiển thị đúng nội dung, bố cục cơ bản; có responsive cơ bản trên Desktop/Mobile; cho phép Bên A xem trực tiếp trên trình duyệt.<br>
        3.2.2. Sau khi hoàn thành Bản dùng thử, Bên B thông báo cho Bên A bằng email/văn bản. Bên A có 05 ngày làm việc để kiểm tra và gửi góp ý chỉnh sửa (không quá 03 vòng chỉnh sửa theo Phụ lục 01).<br>
        3.2.3. Nếu quá thời hạn trên Bên A không có ý kiến bằng văn bản/email, Bản dùng thử được coi là đã được chấp thuận, là căn cứ để Bên A thanh toán Đợt 1.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Nghiệm thu và bàn giao website:</strong><br>
        3.3.1. Sản phẩm bàn giao cuối cùng bao gồm: Website hoạt động trên môi trường production với đầy đủ các chức năng, module theo Phụ lục 01 và 02; Hệ thống CMS quản trị nội dung; Tích hợp đa ngôn ngữ VI/EN; Tối ưu SEO kỹ thuật ở mức độ đã mô tả trong Phụ lục; Tài liệu hướng dẫn sử dụng CMS và tài liệu kỹ thuật; Mã nguồn (source code) theo Điều 8.<br>
        3.3.2. After khi hoàn thành, Bên B thông báo bàn giao và cung cấp đường dẫn, tài khoản truy cập để Bên A kiểm tra. Bên A có 03 (ba) ngày làm việc để kiểm tra và ký Biên bản nghiệm thu nếu sản phẩm đạt yêu cầu hoặc gửi danh sách lỗi/bất cập bằng văn bản/email.<br>
        3.3.3. Bên B có trách nhiệm sửa các lỗi kỹ thuật thuộc phạm vi công việc trong thời hạn hợp lý và thông báo lại cho Bên A nghiệm thu.<br>
        3.3.4. Nếu quá thời hạn 03 ngày làm việc kể từ khi nhận thông báo bàn giao mà Bên A không phản hồi bằng văn bản/email, hoặc Bên A đã đưa website vào sử dụng chính thức, thì được coi như Bên A đã nghiệm thu đầy đủ, là căn cứ để Bên A thanh toán Đợt 2.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Điều chỉnh tiến độ do lỗi của Bên A:</strong> Nếu Bên A chậm cung cấp thông tin, nội dung, phê duyệt thiết kế, hoặc không phối hợp theo yêu cầu hợp lý của Bên B dẫn đến chậm tiến độ, thì thời hạn thực hiện sẽ được kéo dài tương ứng; Bên B không bị coi là chậm tiến độ và không phải chịu phạt; các chi phí phát sinh (nếu có) sẽ được hai bên thỏa thuận bổ sung bằng văn bản.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Chậm tiến độ do lỗi của Bên B:</strong> Nếu Bên B chậm bàn giao sản phẩm cuối cùng so với tiến độ đã thống nhất (sau khi đã trừ đi thời gian chậm trễ do Bên A hoặc bất khả kháng), Bên B phải chịu phạt chậm tiến độ với mức 0.1%/ngày trên giá trị phần nghĩa vụ bị chậm, nhưng tổng mức phạt không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm, theo Điều 301 Luật Thương mại 2005.</td>
    </tr>
  </table>

  {{warranty_clause_html}}

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Quyền của Bên B:</strong><br>
        4.1.1. Nhận đầy đủ và đúng hạn các khoản thanh toán theo Điều 2.<br>
        4.1.2. Yêu cầu Bên A cung cấp kịp thời, đầy đủ thông tin, nội dung, tài liệu cần thiết để thực hiện hợp đồng.<br>
        4.1.3. Từ chối các yêu cầu thay đổi, bổ sung tính năng, nội dung, phạm vi công việc nằm ngoài Hợp đồng và Phụ lục, trừ khi hai bên có thỏa thuận phát sinh bằng văn bản.<br>
        4.1.4. Tạm dừng thực hiện dịch vụ trong trường hợp Bên A chậm thanh toán, không phối hợp hoặc vi phạm nghĩa vụ theo Hợp đồng, sau khi đã thông báo bằng văn bản cho Bên A.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Nghĩa vụ của Bên B:</strong><br>
        4.2.1. Thực hiện công việc theo đúng nội dung, phạm vi, chất lượng, tiến độ đã thỏa thuận.<br>
        4.2.2. Bảo mật thông tin, dữ liệu, tài khoản truy cập do Bên A cung cấp, trừ trường hợp phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền.<br>
        4.2.3. Phối hợp với Bên A trong quá trình nghiệm thu, bàn giao, đào tạo sử dụng CMS.<br>
        4.2.4. Thông báo kịp thời cho Bên A về các sự cố, phát sinh, bất khả kháng ảnh hưởng đến tiến độ, chất lượng dịch vụ.
      </td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Quyền của Bên A:</strong><br>
        5.1.1. Yêu cầu Bên B cung cấp dịch vụ đúng chất lượng, tiến độ, phạm vi đã thỏa thuận.<br>
        5.1.2. Kiểm tra, giám sát tiến độ thực hiện; yêu cầu Bên B báo cáo tình hình triển khai khi cần thiết.<br>
        5.1.3. Đề nghị Bên B sửa lỗi, bảo hành theo Điều 3.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Nghĩa vụ của Bên A:</strong><br>
        5.2.1. Thanh toán đầy đủ, đúng hạn cho Bên B theo Điều 2.<br>
        5.2.2. Cung cấp kịp thời, đầy đủ và đảm bảo tính hợp pháp của: Tên thương hiệu, logo, hình ảnh, tài liệu, nội dung bài viết; Thông tin sản phẩm, dịch vụ, giấy phép, chứng nhận (nếu có); Nội dung Chính sách bảo mật, Điều khoản sử dụng website (nếu yêu cầu tích hợp).<br>
        5.2.3. Chịu trách nhiệm trước pháp luật về tính hợp pháp của toàn bộ nội dung, dữ liệu cung cấp cho Bên B để đưa lên website.<br>
        5.2.4. Phối hợp nghiệm thu, ký biên bản nghiệm thu/bàn giao trong thời hạn quy định.<br>
        5.2.5. Không tự ý can thiệp vào mã nguồn, cấu hình hệ thống khi chưa có sự đồng ý của Bên B trong thời gian bảo hành; nếu tự ý can thiệp dẫn đến lỗi, Bên B có quyền từ chối bảo hành miễn phí.
      </td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 6. THAY ĐỔI PHẠM VI CÔNG VIỆC VÀ PHÁT SINH (CHANGE REQUEST)</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu thay đổi, bổ sung phạm vi công việc, tính năng, giao diện, nội dung ngoài những gì đã mô tả trong Phụ lục 01 và 02 phải được Bên A gửi cho Bên B bằng văn bản/email (Phiếu yêu cầu thay đổi – Change Request).</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong thời hạn 03 ngày làm việc kể từ khi nhận được yêu cầu, Bên B đánh giá tác động đến thời gian, chi phí, kỹ thuật và gửi lại đề xuất (bao gồm chi phí bổ sung, nếu có) cho Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B chỉ triển khai phần phát sinh sau khi hai bên thống nhất bằng văn bản/email về nội dung thay đổi, chi phí và thời gian thực hiện.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu hai bên không thống nhất được về chi phí hoặc điều kiện cho phần phát sinh, Bên B có quyền từ chối thực hiện phần phát sinh đó mà không bị coi là vi phạm Hợp đồng.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 7 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">7</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 7. BẢO MẬT THÔNG TIN VÀ DỮ LIỆU CÁ NHÂN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên cam kết giữ bí mật các thông tin nhận được của nhau trong quá trình thực hiện Hợp đồng, trừ khi thông tin đã công khai; việc tiết lộ là cần thiết cho luật sư, tư vấn, kiểm toán của mình; hoặc phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền theo quy định pháp luật.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Đối với dữ liệu cá nhân của người dùng website (khách hàng, đối tác của Bên A): Bên A là bên kiểm soát dữ liệu (data controller), chịu trách nhiệm xin sự đồng ý hợp lệ của chủ thể dữ liệu, ban hành và công bố Chính sách bảo mật, Điều khoản sử dụng phù hợp pháp luật (bao gồm Nghị định 13/2023/NĐ-CP và các quy định liên quan). Bên B là bên xử lý dữ liệu (data processor) trong phạm vi công việc, chỉ xử lý dữ liệu cá nhân theo chỉ dẫn hợp pháp của Bên A và theo Hợp đồng này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Khi xảy ra sự cố an ninh thông tin liên quan đến hệ thống do Bên B triển khai, Bên B có trách nhiệm phối hợp với Bên A để xác định nguyên nhân, khắc phục trong phạm vi kỹ thuật hợp lý. Trách nhiệm cụ thể của mỗi bên sẽ căn cứ vào lỗi và quy định pháp luật hiện hành.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 8 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">8</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 8. SỞ HỮU TRÍ TUỆ VÀ QUYỀN SỬ DỤNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên A giữ quyền sở hữu đối với toàn bộ nội dung, hình ảnh, tài liệu, logo, nhãn hiệu, dữ liệu do Bên A cung cấp hoặc do Bên A tự tạo ra.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Đối với mã nguồn, thiết kế, cấu trúc hệ thống do Bên B phát triển trong phạm vi Hợp đồng: Bên A được cấp quyền sử dụng không độc quyền, không giới hạn thời gian đối với website và mã nguồn cho mục đích vận hành, kinh doanh của mình; Bên A không được bán lại, cấp phép lại mã nguồn như một sản phẩm phần mềm độc lập cho bên thứ ba nếu không có thỏa thuận bằng văn bản của Bên B.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B vẫn giữ quyền sở hữu và quyền sử dụng đối với các thư viện, framework, công cụ, thành phần mã nguồn dùng chung, ý tưởng, giải pháp kỹ thuật, kiến trúc hệ thống; và quyền tái sử dụng các thành phần này cho các dự án khác, với điều kiện không tiết lộ thông tin mật, dữ liệu kinh doanh của Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B được quyền trích dẫn hình ảnh website, tên dự án vào hồ sơ năng lực/portfolio của mình sau khi được Bên A đồng ý bằng văn bản/email.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 9 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">9</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 9. GIỚI HẠN TRÁCH NHIỆM</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tổng trách nhiệm bồi thường của Bên B (nếu có) phát sinh từ hoặc liên quan đến Hợp đồng này, trong mọi trường hợp, không vượt quá tổng giá trị thực tế Bên A đã thanh toán cho Bên B theo Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B không chịu trách nhiệm đối với: thiệt hại gián tiếp, lợi nhuận bị mất, mất dữ liệu, mất cơ hội kinh doanh, tổn thất uy tín của Bên A; hoặc sự cố do lỗi của bên thứ ba (nhà cung cấp hosting, tên miền, email, nền tảng cloud, …) hoặc do Bên A/nhân sự/Bên thứ ba do Bên A chỉ định can thiệp vào hệ thống.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 10 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">10</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 10. VI PHẠM HỢP ĐỒNG VÀ PHẠT VI PHẠM</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên nào vi phạm nghĩa vụ cơ bản theo Hợp đồng gây thiệt hại cho bên kia thì, ngoài việc phải khắc phục vi phạm, còn phải bồi thường thiệt hại thực tế (nếu bên bị vi phạm chứng minh được) và chịu phạt vi phạm nếu có thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mức phạt vi phạm (bao gồm phạt chậm tiến độ, chậm thanh toán và các vi phạm khác nếu có thỏa thuận) không vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm, phù hợp Điều 301 Luật Thương mại 2005.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Việc phạt vi phạm không loại trừ quyền yêu cầu bồi thường thiệt hại thực tế của bên bị vi phạm, trong giới hạn trách nhiệm quy định tại Điều 9.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 11 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">11</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 11. HIỆU LỰC, SỬA ĐỔI VÀ CHẤM DỨT HỢP ĐỒNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng có hiệu lực kể từ ngày đại diện hợp pháp của hai bên ký và đóng dấu (nếu có) đến khi các bên hoàn thành nghĩa vụ, trừ khi chấm dứt trước hạn theo quy định tại Điều này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi sửa đổi, bổ sung Hợp đồng phải được lập thành văn bản (hoặc email có xác nhận hai bên) và là bộ phận không tách rời của Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Quyền đơn phương chấm dứt Hợp đồng:</strong> Mỗi bên có quyền đơn phương chấm dứt Hợp đồng trong các trường hợp: (a) Bên kia vi phạm nghiêm trọng nghĩa vụ thanh toán/giao hàng/bảo mật và không khắc phục trong vòng 15 ngày làm việc kể từ khi nhận được thông báo bằng văn bản; (b) Bên kia lâm vào tình trạng phá sản, giải thể hoặc không còn khả năng thực hiện Hợp đồng; (c) Các trường hợp khác theo quy định pháp luật.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Hậu quả của việc đơn phương chấm dứt:</strong> Nếu Bên A đơn phương chấm dứt Hợp đồng không do lỗi của Bên B: Bên B được giữ lại toàn bộ số tiền Bên A đã thanh toán; Bên A thanh toán cho Bên B phần giá trị công việc Bên B đã thực hiện nhưng chưa được thanh toán (nếu có); hai bên thanh lý Hợp đồng, Bên B không phải hoàn trả tiền đã nhận, trừ khi có thỏa thuận khác. Nếu Bên B đơn phương chấm dứt Hợp đồng không do lỗi của Bên A: Bên B hoàn trả cho Bên A phần tiền đã nhận tương ứng với phần công việc chưa thực hiện; Bên B chịu phạt vi phạm (nếu có) nhưng không vượt quá 8% giá trị phần nghĩa vụ chưa thực hiện bị vi phạm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp chấm dứt do bất khả kháng hoặc lý do khách quan khác theo thỏa thuận, hai bên sẽ thương lượng để thanh toán phần công việc đã thực hiện và không bên nào phải chịu phạt.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 12 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">12</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 12. BẤT KHẢ KHÁNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bất khả kháng là các sự kiện xảy ra một cách khách quan, không thể lường trước và không thể khắc phục được dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép, như: thiên tai, hỏa hoạn lớn, chiến tranh, bạo loạn, dịch bệnh, thay đổi chính sách pháp luật làm cho việc thực hiện Hợp đồng trở nên không thể thực hiện được, …</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên gặp sự kiện bất khả kháng phải thông báo cho bên kia trong thời hạn 05 ngày kể từ khi xảy ra sự kiện và cung cấp tài liệu chứng minh (nếu có). Hai bên sẽ thương lượng để gia hạn thời gian thực hiện hoặc các biện pháp khác.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 13 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">13</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 13. GIẢI QUYẾT TRANH CHẤP VÀ LUẬT ÁP DỤNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi tranh chấp phát sinh từ hoặc liên quan đến Hợp đồng trước hết được giải quyết thông qua thương lượng, hòa giải trên tinh thần hợp tác, tôn trọng lẫn nhau trong thời hạn 30 ngày kể từ ngày phát sinh tranh chấp.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu hết thời hạn trên mà không giải quyết được, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại Thành phố Hà Nội để giải quyết. Quyết định của Tòa án là quyết định cuối cùng, các bên có nghĩa vụ thi hành. Án phí, lệ phí do bên thua kiện chịu, trừ khi Tòa án có quyết định khác.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 14 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">14</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 14. ĐIỀU KHOẢN CHUNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Những vấn đề không được quy định hoặc quy định chưa đầy đủ trong Hợp đồng này sẽ được áp dụng theo quy định của pháp luật Việt Nam hiện hành.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng gồm {{contract_clause_count}}, kèm theo Phụ lục 01 và Phụ lục 02, được lập thành 02 (hai) bản gốc bằng tiếng Việt, mỗi bên giữ 01 (một) bản, có giá trị pháp lý như nhau.</td>
    </tr>
  </table>

  <p style="margin:15px 0; text-align:justify;">Hai bên đã đọc kỹ tất cả các điều khoản của hợp đồng, hiểu rõ quyền lợi và trách nhiệm pháp lý của việc giao kết Hợp đồng này. Tại thời điểm ký kết, đại diện hai bên đều có năng lực pháp luật và năng lực hành vi dân sự đầy đủ.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 30px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">ĐẠI DIỆN BÊN A</td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">ĐẠI DIỆN BÊN B</td>
    </tr>
    <tr>
      <td style="text-align:center; font-style:italic; font-size:9pt; color:#666;">(Ký, ghi rõ họ tên, đóng dấu)</td>
      <td style="text-align:center; font-style:italic; font-size:9pt; color:#666;">(Ký, ghi rõ họ tên, đóng dấu)</td>
    </tr>
    <tr>
      <td style="height:100px;"></td>
      <td style="height:100px;"></td>
    </tr>
  </table>

  <!-- ========== PHỤ LỤC 01: BẢNG BÁO GIÁ CHI TIẾT ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 20px 0 10px 0;">PHỤ LỤC 01 — BẢNG BÁO GIÁ CHI TIẾT</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm Hợp đồng dịch vụ số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:8pt; table-layout:auto;">
    <tr style="background:#f5f5f5;">
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">STT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:100%;">Hạng mục & Mô tả chi tiết</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">ĐVT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">SL</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Đơn giá</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">CK(%)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Giảm giá</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Thành tiền</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">VAT(%)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tiền VAT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tổng cộng</th>
    </tr>
    {{contract_items_table}}
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="10"><strong>Tạm tính</strong></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">{{gross_total}}</td>
    </tr>
    {{discount_row_html}}
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="10"><strong>Tổng chiết khấu</strong></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; white-space:nowrap;">-{{total_discount}}</td>
    </tr>
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="10"><strong>Cộng tiền hàng</strong></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">{{subtotal}}</td>
    </tr>
    {{vat_breakdown_html}}
    <tr style="background:#e8e8e8;">
      <td style="border:1px solid #000; padding:6px; font-size:9pt;" colspan="10"><strong>Tổng cộng thanh toán</strong></td>
      <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold; font-size:9pt; white-space:nowrap;">{{total_amount_number}} VND</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:4px;" colspan="11">Số tiền viết bằng chữ: <em>{{amount_in_words}}</em></td>
    </tr>
  </table>

  <!-- ========== PHỤ LỤC 02: ĐỀ XUẤT GIẢI PHÁP ========== -->
  {{proposal_appendix_html}}

</div>
`;
