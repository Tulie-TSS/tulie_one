/**
 * ECONOMIC CONTRACT TEMPLATES (B2B) - HTML Layouts
 * Standard layouts matching the corporate identity of Tulie.
 * Auto variables: {{variable_name}}
 */

// ==========================================
// 1. SOFTWARE & WEBSITE DEVELOPMENT TEMPLATE (HĐ 1 - VAT EXEMPT)
// ==========================================
export const contractSoftwareTemplate = `
<div style="font-family: Arial, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'MS Gothic', sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 0; line-height: 1.5; text-align: justify;">
  <!-- Header: 2 columns -->
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

  <!-- Contract Number & Date -->
  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{contract_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">{{contract_title_upper}}</p>

  <!-- Legal grounds - Italicized -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự số 91/2015/QH13 có hiệu lực từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thương mại số 36/2005/QH11 có hiệu lực từ ngày 01/01/2006 và các văn bản hướng dẫn thi hành;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Công nghệ thông tin số 67/2006/QH11;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Sở hữu trí tuệ số 50/2005/QH11 (sửa đổi, bổ sung năm 2022);</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Nghị định số 52/2013/NĐ-CP về thương mại điện tử và các văn bản sửa đổi, bổ sung (áp dụng trong trường hợp phần mềm/website là ứng dụng TMĐT);</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Nghị định số 71/2007/NĐ-CP về công nghiệp công nghệ thông tin;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thuế giá trị gia tăng và Thông tư số 219/2013/TT-BTC của Bộ Tài chính, đặc biệt Khoản 21 Điều 4, và các văn bản sửa đổi, bổ sung;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ nhu cầu sử dụng dịch vụ của Bên A và khả năng cung cấp dịch vụ của Bên B;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào sự thỏa thuận của hai bên.</p>

  <p style="margin:10px 0;">Hôm nay, tại trụ sở {{customer_company}}, chúng tôi gồm:</p>

  <!-- Parties A & B Table -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt; text-align:left;" cellpadding="2">
    <colgroup>
      <col style="width:170px">
      <col style="width:220px">
      <col style="width:70px">
      <col style="width:auto">
    </colgroup>

    <!-- Bên A -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên sử dụng dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:;">{{customer_company}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">{{customer_representative_title}} {{customer_representative}}</td>
      <td style="vertical-align:top; white-space:nowrap; padding-left:15px;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{customer_position}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">{{customer_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;">{{customer_phone}}</td>
      <td style="vertical-align:top; padding-left:15px;">Di động:</td>
      <td style="vertical-align:top;">{{customer_mobile}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">{{customer_tax_code}}</td>
      <td style="vertical-align:top; padding-left:15px;">Email:</td>
      <td style="vertical-align:top;">{{customer_email}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">{{customer_bank_account}}</td>
      <td style="vertical-align:top; padding-left:15px;">tại</td>
      <td style="vertical-align:top;">{{customer_bank_name}}</td>
    </tr>

    <!-- Spacer -->
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>

    <!-- Bên B -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên cung cấp dịch vụ (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">Ông Nguyễn Thanh Tùng</td>
      <td style="vertical-align:top; white-space:nowrap; padding-left:15px;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">Giám đốc</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;"></td>
      <td style="vertical-align:top; padding-left:15px;">Di động:</td>
      <td style="vertical-align:top;">+84 98 898 4554</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">0110163102</td>
      <td style="vertical-align:top; padding-left:15px;">Email:</td>
      <td style="vertical-align:top;">info@tulie.vn</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">86683979</td>
      <td style="vertical-align:top; padding-left:15px;">tại</td>
      <td style="vertical-align:top;">Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank) - TTGD Hội sở</td>
    </tr>
  </table>

  <p style="margin:15px 0;">Hai bên cùng thống nhất ký kết Hợp đồng này (sau đây gọi tắt là “Hợp đồng này”) với các điều khoản sau:</p>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">1</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 1. ĐỐI TƯỢNG VÀ PHẠM VI DỊCH VỤ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cung cấp cho Bên A dịch vụ phát triển phần mềm ứng dụng dạng website (sau đây gọi là &ldquo;Phần mềm&rdquo;), bao gồm nhưng không giới hạn các công việc chính sau:
        <div style="margin-left: 10px; margin-top: 4px; line-height: 1.6;">
          a) Khảo sát, phân tích yêu cầu nghiệp vụ, yêu cầu chức năng của Bên A;<br>
          b) Thiết kế kiến trúc hệ thống, cơ sở dữ liệu, luồng xử lý;<br>
          c) Thiết kế giao diện chuẩn đáp ứng (Responsive) hiển thị tối ưu trên điện thoại di động, máy tính bảng và máy tính để bàn, đảm bảo tiêu chuẩn về khả năng truy cập và trải nghiệm người dùng;<br>
          d) Phát triển, lập trình các mô-đun giao diện người dùng, mô-đun xử lý nghiệp vụ, hệ thống quản trị nội dung (CMS) và các chức năng kèm theo;<br>
          đ) Tích hợp các chức năng, mô-đun theo yêu cầu chi tiết tại {{appendix_list_text}};<br>
          e) Kiểm thử, hiệu chỉnh, tối ưu hiệu năng và an toàn bảo mật Phần mềm;<br>
          g) Triển khai Phần mềm lên môi trường vận hành (production) theo cấu hình hai bên thống nhất;<br>
          h) Bàn giao mã nguồn (source code), cơ sở dữ liệu, tài liệu kỹ thuật hỗ trợ và tài liệu hướng dẫn sử dụng cho Bên A.
        </div>
      </td>
    </tr>
    {{clause_1_2_html}}
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_total_value_number}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">{{scope_appendix_ref}}</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_appendix_number}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên thống nhất: Dịch vụ theo Hợp đồng này là sản phẩm phần mềm/dịch vụ phần mềm theo quy định của pháp luật về công nghệ thông tin.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_appendix_number_plus1}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu bổ sung, thay đổi ngoài phạm vi quy định tại các Phụ lục được coi là yêu cầu thay đổi phạm vi công việc và được xử lý theo Điều 6 Hợp đồng này.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 2. GIÁ TRỊ HỢP ĐỒNG, THUẾ GIÁ TRỊ GIA TĂNG VÀ PHƯƠNG THỨC THANH TOÁN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Giá trị hợp đồng:</strong> Tổng giá trị Hợp đồng: <strong>{{total_amount_number}} VNĐ</strong> (Bằng chữ: <em>{{amount_in_words}}</em>). Cơ cấu giá chi tiết theo Phụ lục 01.
      </td>
    </tr>
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">2.2.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Thuế giá trị gia tăng:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên thống nhất: Dịch vụ theo Hợp đồng này thuộc nhóm sản phẩm phần mềm/dịch vụ phần mềm theo Luật Công nghệ thông tin và Nghị định 71/2007/NĐ-CP, thuộc đối tượng không chịu thuế giá trị gia tăng theo Khoản 21 Điều 4 Thông tư 219/2013/TT-BTC. Giá trị Hợp đồng nêu tại Khoản 2.1 là giá trị không chịu thuế GTGT.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp cơ quan thuế có thẩm quyền xác định dịch vụ theo Hợp đồng này phải chịu thuế GTGT, hai bên sẽ lập Phụ lục điều chỉnh giá trị thanh toán tương ứng phần thuế GTGT phát sinh. Bên A có trách nhiệm thanh toán bổ sung phần thuế GTGT theo hóa đơn hợp lệ do Bên B xuất. Việc điều chỉnh này không bị coi là vi phạm Hợp đồng của Bên B.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tổng giá trị thanh toán:</strong> Tổng giá trị thanh toán Bên A phải thanh toán cho Bên B theo Hợp đồng là: <strong>{{total_amount_number}} VNĐ</strong> (Bằng chữ: <em>{{amount_in_words}}</em>). Giá trị này chưa bao gồm thuế GTGT nếu phát sinh theo kết luận của cơ quan thuế có thẩm quyền.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tiến độ thanh toán:</strong> Trừ khi hai bên có thỏa thuận khác bằng văn bản, tiến độ thanh toán được quy định như sau:<br>{{payment_terms}}
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Phương thức thanh toán:</strong> Bên A thanh toán cho Bên B bằng chuyển khoản vào tài khoản ngân hàng sau:<br>
        <table style="margin-left:0; margin-top:4px; border-collapse:collapse; line-height:1.6; font-size:inherit;">
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Tên tài khoản:</td><td style="padding:1px 0 1px 6px;"><strong>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</strong></td></tr>
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Số tài khoản:</td><td style="padding:1px 0 1px 6px;"><strong>86683979</strong></td></tr>
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Ngân hàng:</td><td style="padding:1px 0 1px 6px;"><strong>TMCP Kỹ Thương Việt Nam (Techcombank) – TTGD Hội Sở</strong></td></tr>
        </table>
        Ngày thanh toán được xác định là ngày tiền được ghi Có vào tài khoản của Bên B.
      </td>
    </tr>
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">2.6.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Chậm thanh toán:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.6.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu Bên A chậm thanh toán bất kỳ khoản nào quá 05 (năm) ngày làm việc so với hạn thanh toán, Bên A phải chịu lãi chậm trả với mức 0,05%/ngày tính trên số tiền chậm trả, nhưng tổng mức phạt và lãi chậm trả không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm theo Điều 301 Luật Thương mại 2005.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.6.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu Bên A chậm thanh toán quá 15 (mười lăm) ngày làm việc, Bên B có quyền tạm dừng thực hiện công việc cho đến khi nhận đủ khoản thanh toán tương ứng, kéo dài thời hạn thực hiện Hợp đồng tương ứng thời gian tạm dừng mà không bị coi là chậm tiến độ.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 3. THỜI GIAN THỰC HIỆN, NGHIỆM THU VÀ BÀN GIAO</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phân kỳ thực hiện, ngày nghiệm thu chi tiết và sản phẩm bàn giao: Thời hạn thực hiện dự kiến là {{delivery_time}} ngày theo lịch (tính từ ngày Hợp đồng có hiệu lực và Bên B nhận được tạm ứng Đợt 1). Ngày hoàn thành dự kiến: {{end_date}}. Lộ trình và phân kỳ thực hiện được quy định chi tiết tại Phụ lục 01. Tại từng phân kỳ, Bên A có trách nhiệm tiến hành kiểm thử, nghiệm thu và gửi yêu cầu sửa lỗi (nếu có). Ngày hoàn thành và ngày nghiệm thu chi tiết được điều chỉnh tương ứng nếu tiến độ bị ảnh hưởng do Bên A chậm phản hồi, chậm cung cấp thông tin hoặc khi phát sinh thay đổi phạm vi theo Điều 6. Sản phẩm bàn giao bao gồm: bàn giao mã nguồn (source code), tài liệu hướng dẫn sử dụng, cơ sở dữ liệu và tài liệu kỹ thuật hỗ trợ vận hành.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bản dùng thử (Staging): Sau khi hoàn thành bản dùng thử trên môi trường kiểm thử, Bên B thông báo cho Bên A bằng email/văn bản. Bên A có 05 ngày làm việc để kiểm tra và gửi góp ý chỉnh sửa (không quá 03 vòng chỉnh sửa theo phạm vi Phụ lục 01). Nếu quá thời hạn trên Bên A không có ý kiến phản hồi bằng văn bản/email, bản dùng thử được coi là đã được chấp thuận, làm căn cứ để Bên A thanh toán đợt tương ứng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nghiệm thu và bàn giao Phần mềm:<br>
      a) Sau khi hoàn thành Phần mềm, Bên B gửi thông báo bàn giao kèm tài khoản kiểm thử cho Bên A. Trong thời hạn 05 ngày làm việc, Bên A có trách nhiệm kiểm tra và ký Biên bản nghiệm thu. Lỗi kỹ thuật nghiêm trọng (làm gián đoạn chức năng chính, rò rỉ dữ liệu hoặc không thể vận hành) sẽ được Bên B khắc phục miễn phí trong thời gian hợp lý. Các lỗi hiển thị, căn chỉnh giao diện nhỏ (lỗi không nghiêm trọng) không là lý do để Bên A từ chối ký Biên bản nghiệm thu và sẽ được khắc phục trong thời hạn bảo hành.<br>
      b) Coi như nghiệm thu: Phần mềm được mặc nhiên coi là đã nghiệm thu hoàn thành đạt chất lượng và Bên A có nghĩa vụ thanh toán đủ 100% giá trị Hợp đồng nếu xảy ra một trong các trường hợp: (i) Quá 05 ngày làm việc kể từ khi nhận thông báo bàn giao mà Bên A không phản hồi bằng văn bản/email; hoặc (ii) Bên A tự ý/cho phép đưa Phần mềm vào vận hành chính thức, gắn tên miền chính (Production), hoặc nạp dữ liệu kinh doanh thực tế để sử dụng.<br>
      c) Bên B có quyền tạm hoãn bàn giao mã nguồn chi tiết/tài khoản quản trị cao nhất (Root/Admin) cho đến khi Bên A hoàn tất 100% nghĩa vụ thanh toán.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Điều chỉnh tiến độ do lỗi của Bên A: Nếu Bên A chậm cung cấp thông tin, dữ liệu, phê duyệt, tài khoản truy cập, quyền truy cập hạ tầng, hoặc không phối hợp theo yêu cầu hợp lý của Bên B dẫn đến chậm tiến độ, thì thời hạn thực hiện sẽ được kéo dài tương ứng; Bên B không bị coi là chậm tiến độ và không phải chịu phạt; các chi phí phát sinh (nếu có) sẽ được hai bên thỏa thuận bổ sung bằng văn bản. Thời gian gia hạn do phát sinh hoặc do Bên A chậm phối hợp không tính vào thời gian chậm tiến độ của Bên B.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Chậm tiến độ do lỗi của Bên B: Nếu Bên B chậm bàn giao Phần mềm so với tiến độ đã thống nhất (sau khi đã trừ đi thời gian chậm trễ do Bên A, phát sinh được chấp thuận, hoặc do bất khả kháng), Bên B phải chịu phạt chậm tiến độ với mức 0,1%/ngày trên giá trị phần nghĩa vụ bị chậm, nhưng tổng mức phạt không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm, theo Điều 301 Luật Thương mại 2005.</td>
    </tr>
  </table>

  {{warranty_clause_html}}

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">4.1.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Quyền của Bên B:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nhận đầy đủ và đúng hạn các khoản thanh toán theo Điều 2.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên A cung cấp kịp thời, đầy đủ thông tin, nội dung, tài liệu cần thiết để thực hiện hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Từ chối các yêu cầu thay đổi, bổ sung tính năng, nội dung, phạm vi công việc nằm ngoài Hợp đồng và Phụ lục, trừ khi hai bên có thỏa thuận phát sinh bằng văn bản.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tạm dừng thực hiện dịch vụ trong trường hợp Bên A chậm thanh toán, không phối hợp hoặc vi phạm nghĩa vụ theo Hợp đồng, sau khi đã thông báo bằng văn bản cho Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tạm hoãn bàn giao mã nguồn, tài khoản quản trị đầy đủ hoặc các quyền truy cập kỹ thuật khác nếu Bên A chưa thanh toán đủ các khoản đến hạn.</td>
    </tr>
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">4.2.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Nghĩa vụ của Bên B:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thực hiện công việc theo đúng nội dung, phạm vi, chất lượng, tiến độ đã thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật thông tin, dữ liệu, tài khoản truy cập do Bên A cung cấp, trừ trường hợp phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phối hợp với Bên A trong quá trình nghiệm thu, bàn giao, đào tạo sử dụng Phần mềm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thông báo kịp thời cho Bên A về các sự cố, phát sinh, bất khả kháng ảnh hưởng đến tiến độ, chất lượng dịch vụ.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">5.1.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Quyền của Bên A:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên B cung cấp dịch vụ đúng chất lượng, tiến độ, phạm vi đã thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Kiểm tra, giám sát tiến độ thực hiện; yêu cầu Bên B báo cáo tình hình triển khai khi cần thiết.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Đề nghị Bên B sửa lỗi, bảo hành theo Điều 3.</td>
    </tr>
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">5.2.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Nghĩa vụ của Bên A:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thanh toán đầy đủ, đúng hạn cho Bên B theo Điều 2.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Cung cấp kịp thời, đầy đủ và đảm bảo tính hợp pháp của toàn bộ nội dung, dữ liệu, hình ảnh, tài liệu và yêu cầu chi tiết để lập trình Phần mềm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Chịu trách nhiệm trước pháp luật về tính hợp pháp của toàn bộ nội dung, dữ liệu cung cấp cho Bên B để đưa lên Phần mềm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phối hợp nghiệm thu, ký biên bản nghiệm thu/bàn giao trong thời hạn quy định.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Không tự ý can thiệp vào mã nguồn, cấu hình hệ thống khi chưa có sự đồng ý của Bên B trong thời gian bảo hành; nếu tự ý can thiệp dẫn đến lỗi, Bên B có quyền từ chối bảo hành miễn phí.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 6. THAY ĐỔI PHẠM VI CÔNG VIỆC</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu thay đổi, bổ sung phạm vi công việc, tính năng, giao diện, nội dung ngoài những gì đã mô tả trong {{change_scope_ref}} phải được Bên A gửi cho Bên B bằng văn bản/email.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong vòng 05 ngày làm việc kể từ khi nhận được yêu cầu, Bên B đánh giá tác động đến thời gian, chi phí, kỹ thuật và gửi lại đề xuất cho Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B chỉ triển khai phần phát sinh sau khi hai bên thống nhất bằng văn bản/email về nội dung thay đổi, chi phí và thời gian thực hiện. Bên A tạm ứng tối thiểu 50% giá trị phát sinh trước khi Bên B triển khai phần phát sinh.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu hai bên không thống nhất được, Bên B có quyền từ chối thực hiện phần phát sinh đó mà không bị coi là vi phạm Hợp đồng.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 7 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">7</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 7. BẢO MẬT THÔNG TIN VÀ DỮ LIỆU CÁ NHÂN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên cam kết giữ bí mật các thông tin nhận được của nhau trong quá trình thực hiện Hợp đồng, trừ khi thông tin đã công khai hoặc phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.</td>
      <td style="vertical-align:top; padding:2px 0;">Bảo mật thông tin và dữ liệu cá nhân (Tuân thủ Nghị định 13/2023/NĐ-CP):</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật thông tin và quyền riêng tư: Bên B cam kết đảm bảo an toàn, bảo mật thông tin và quyền riêng tư đối với dữ liệu của Bên A và người dùng; triển khai giải pháp kỹ thuật phòng chống tấn công mạng, bảo vệ hệ thống khỏi rò rỉ dữ liệu và duy trì cơ chế sao lưu dự phòng (backup) dữ liệu định kỳ. Bên A là Bên Kiểm soát dữ liệu cá nhân (Data Controller), Bên B là Bên Xử lý dữ liệu cá nhân (Data Processor).</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật mã nguồn và dữ liệu: Không được chia sẻ, sao chép hoặc sử dụng dữ liệu của Bên A vào bất kỳ mục đích nào khác nếu không có sự đồng ý của Bên A bằng văn bản. Bên B bảo lưu trách nhiệm kỹ thuật và tuân thủ tuyệt đối quy định bảo mật thông tin của Hợp đồng.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 8 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">8</td>
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
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Quyền đối với Mã nguồn dự án: Bên B cấp cho Bên A quyền sử dụng độc quyền (hoặc sở hữu mã nguồn thành phẩm thiết kế riêng cho Bên A) sau khi Bên A đã hoàn tất thanh toán 100% giá trị Hợp đồng và các khoản phát sinh (nếu có). Trước thời điểm thanh toán đủ 100%, toàn bộ quyền sở hữu trí tuệ đối với mã nguồn thuộc về Bên B; Bên A chỉ có quyền sử dụng trên môi trường do Bên B triển khai, không được trích xuất, sao chép, sửa đổi, chuyển giao hoặc bán lại cho Bên thứ ba.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mã nguồn nền tảng & Thư viện dùng chung: Bên B bảo lưu hoàn toàn quyền sở hữu trí tuệ đối với các cấu trúc mã nguồn cốt lõi (Core Framework), thư viện lập trình dùng chung, thuật toán, công cụ tích hợp sẵn do Bên B phát triển. Bên A được cấp quyền sử dụng vĩnh viễn, không mất phí bản quyền (Royalty-free non-exclusive license) đối với các thành phần dùng chung này chỉ nhằm mục đích vận hành Phần mềm theo Hợp đồng. Bên B có quyền tái sử dụng các thành phần dùng chung này cho các dự án khác với điều kiện không tiết lộ thông tin mật của Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B được quyền trích dẫn hình ảnh Phần mềm, tên dự án vào hồ sơ năng lực/portfolio của mình sau khi được Bên A đồng ý bằng văn bản/email.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 9 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">9</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 9. GIỚI HẠN TRÁCH NHIỆM</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tổng trách nhiệm bồi thường của Bên B (nếu có) phát sinh từ hoặc liên quan đến Hợp đồng này, trong mọi trường hợp, không vượt quá tổng giá trị thực tế Bên A đã thanh toán cho Bên B theo Hợp đồng. Mọi yêu cầu bồi thường thiệt hại của Bên A phải được gửi bằng văn bản cho Bên B trong vòng 30 ngày kể từ ngày phát sinh sự cố. Quá thời hạn này, Bên B được mặc nhiên miễn trừ trách nhiệm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B không chịu trách nhiệm đối với: thiệt hại gián tiếp, lợi nhuận bị mất, mất dữ liệu, mất cơ hội kinh doanh, tổn thất uy tín của Bên A; hoặc sự cố do lỗi của bên thứ ba (nhà cung cấp hosting, tên miền, email, nền tảng cloud, tấn công DDoS, mã độc…) hoặc do Bên A/nhân sự/Bên thứ ba do Bên A chỉ định can thiệp vào hệ thống.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 10 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">10</td>
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
  </table>

  <!-- ========== ĐIỀU 11 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">11</td>
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
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Quyền đơn phương chấm dứt Hợp đồng: Mỗi bên có quyền đơn phương chấm dứt Hợp đồng trong các trường hợp: (a) Bên kia vi phạm nghiêm trọng nghĩa vụ thanh toán/giao hàng/bảo mật và không khắc phục trong vòng 15 ngày làm việc kể từ khi nhận được thông báo bằng văn bản; (b) Bên kia lâm vào tình trạng phá sản, giải thể hoặc không còn khả năng thực hiện Hợp đồng; (c) Các trường hợp khác theo quy định pháp luật.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.4.</td>
      <td style="vertical-align:top; padding:2px 0;">Hậu quả của việc đơn phương chấm dứt & Chuyển giao dữ liệu:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.4.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu Bên A đơn phương chấm dứt Hợp đồng không do lỗi của Bên B: Bên B được giữ lại toàn bộ số tiền Bên A đã thanh toán; Bên A có nghĩa vụ thanh toán bổ sung cho Bên B tương ứng với 100% khối lượng công việc Bên B đã thực hiện tính đến thời điểm chấm dứt.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.4.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu Bên B đơn phương chấm dứt Hợp đồng không do lỗi của Bên A: Bên B hoàn trả cho Bên A phần tiền đã nhận tương ứng với phần khối lượng công việc chưa thực hiện; chịu phạt vi phạm (nếu có) nhưng không vượt quá 8% giá trị phần nghĩa vụ chưa thực hiện bị vi phạm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.4.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bàn giao dữ liệu và mã nguồn khi chấm dứt: Bên B chỉ thực hiện bàn giao mã nguồn và xuất dữ liệu thô (định dạng SQL/Excel/JSON) cho Bên A với điều kiện Bên A đã hoàn tất 100% nghĩa vụ thanh toán cho phần việc đã làm. Chi phí trích xuất dữ liệu nâng cao hoặc hỗ trợ chuyển giao (migration) sang hạ tầng mới nằm ngoài phạm vi Hợp đồng sẽ do Bên A chi trả theo đơn giá dịch vụ của Bên B tại thời điểm đó.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp chấm dứt do bất khả kháng hoặc lý do khách quan khác theo thỏa thuận, hai bên sẽ thương lượng để thanh toán phần công việc đã thực hiện và không bên nào phải chịu phạt.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 12 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">12</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 12. SỰ KIỆN BẤT KHẢ KHÁNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bất khả kháng là các sự kiện xảy ra một cách khách quan, không thể lường trước và không thể khắc phục được dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép, như: thiên tai, hỏa hoạn lớn, chiến tranh, bạo loạn, dịch bệnh, thay đổi chính sách pháp luật làm cho việc thực hiện Hợp đồng trở nên không thể thực hiện được...</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên gặp sự kiện bất khả kháng phải thông báo cho bên kia trong thời hạn 05 ngày làm việc kể từ khi xảy ra sự kiện và cung cấp tài liệu chứng minh (nếu có). Hai bên sẽ thương lượng để gia hạn thời gian thực hiện hoặc các biện pháp khác.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 13 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">13</td>
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
      <td style="width:50px; font-weight:bold; vertical-align:top;">14</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 14. ĐIỀU KHOẢN CHUNG & PHỤ LỤC HỢP ĐỒNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Các Phụ lục kèm theo Hợp đồng này (bao gồm nhưng không giới hạn: Phụ lục phạm vi công việc, Phụ lục bảng giá chi tiết, Phụ lục bổ sung phát sinh…) là bộ phận không tách rời và có giá trị pháp lý như Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp có mâu thuẫn giữa nội dung Hợp đồng và Phụ lục, thì ưu tiên áp dụng nội dung tại Phụ lục mới nhất (được ký sau cùng) đối với phần công việc, giá trị, tiến độ được điều chỉnh. Các nội dung khác không được điều chỉnh trong Phụ lục vẫn áp dụng theo Hợp đồng chính. Việc ký thêm Phụ lục không làm mất hiệu lực của các điều khoản khác trong Hợp đồng, trừ khi các bên có thỏa thuận khác bằng văn bản. Phụ lục có thể lập dưới hình thức văn bản giấy hoặc email có xác nhận của hai bên.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Những vấn đề không được quy định hoặc quy định chưa đầy đủ trong Hợp đồng này sẽ được áp dụng theo quy định của pháp luật Việt Nam hiện hành.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng gồm {{contract_clause_count}}, kèm theo {{appendix_list_text}}, được lập thành 02 (hai) bản gốc bằng tiếng Việt, mỗi bên giữ 01 (một) bản, có giá trị pháp lý như nhau.</td>
    </tr>
  </table>

  <p style="margin:15px 0; text-align:justify;">Hai bên đã đọc kỹ tất cả các điều khoản của hợp đồng, hiểu rõ quyền lợi và trách nhiệm pháp lý của việc giao kết Hợp đồng này. Đại diện hai bên cam kết có đầy đủ thẩm quyền, tự nguyện ký kết và cam kết thực hiện đúng các nghĩa vụ đã thỏa thuận.</p>

  <!-- Signatures -->
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

  <!-- ========== PHỤ LỤC 01: PHẠM VI CÔNG VIỆC, BẢNG GIÁ & LỘ TRÌNH ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 0 0 6px 0;">Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm {{contract_type}} số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

  <p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">I. DANH MỤC SẢN PHẨM, DỊCH VỤ VÀ BÁO GIÁ CHI TIẾT</p>
  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:8pt; table-layout:auto;">
    <tr style="background:#f5f5f5;">
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">STT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:100%;">Hạng mục & Mô tả chi tiết</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">ĐVT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">SL</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Đơn giá (chưa VAT)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Thành tiền (chưa VAT)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">VAT(%)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tiền VAT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tổng cộng</th>
    </tr>
    {{contract_items_table}}
    <tr style="background:#f9f9f9;">
      <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold;" colspan="8">Cộng tiền hàng (chưa VAT):</td>
      <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold; white-space:nowrap;">{{subtotal}}</td>
    </tr>
    {{vat_breakdown_html}}
    <tr style="background:#e8e8e8;">
      <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt;" colspan="8">Tổng cộng thanh toán:</td>
      <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt; white-space:nowrap;">{{total_amount_number}} VND</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:4px;" colspan="9">Số tiền viết bằng chữ: <em>{{amount_in_words}}</em></td>
    </tr>
  </table>

  {{proposal_appendix_content_html}}
  <p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">II. CAM KẾT</p>
  <p style="margin: 0 0 15px 0;">Phụ lục này là một phần không tách rời của Hợp đồng số {{contract_number}}. Các điều khoản khác của Hợp đồng không được sửa đổi trong Phụ lục này vẫn giữ nguyên hiệu lực.</p>

  <!-- Signatures -->
  <table style="width:100%; margin-top: 20px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top; font-size:9pt;">ĐẠI DIỆN BÊN A</td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top; font-size:9pt;">ĐẠI DIỆN BÊN B</td>
    </tr>
    <tr>
      <td style="text-align:center; font-style:italic; font-size:9pt; color:#666;">(Ký, ghi rõ họ tên, đóng dấu)</td>
      <td style="text-align:center; font-style:italic; font-size:9pt; color:#666;">(Ký, ghi rõ họ tên, đóng dấu)</td>
    </tr>
  </table>

</div>
`;

// ==========================================
// 1B. SCHOOL & EDUCATIONAL SOFTWARE / WEBSITE TEMPLATE (HĐ 3 - VAT EXEMPT)
// ==========================================
export const contractSchoolTemplate = `
<div style="font-family: Arial, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'MS Gothic', sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 0; line-height: 1.5; text-align: justify;">
  <!-- Header: 2 columns -->
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

  <!-- Contract Number & Date -->
  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{contract_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">{{contract_title_upper}}</p>

  <!-- Legal grounds - Italicized -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự số 91/2015/QH13 có hiệu lực từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thương mại số 36/2005/QH11 có hiệu lực từ ngày 01/01/2006 và các văn bản hướng dẫn thi hành;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Công nghệ thông tin số 67/2006/QH11;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Sở hữu trí tuệ năm 2005 (sửa đổi, bổ sung năm 2022);</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Nghị định số 52/2013/NĐ-CP về thương mại điện tử và các văn bản sửa đổi, bổ sung áp dụng trong trường hợp phần mềm/website là ứng dụng TMĐT;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Giáo dục số 43/2019/QH14 và các quy định pháp luật liên quan;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Nghị định số 71/2007/NĐ-CP về công nghiệp công nghệ thông tin;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thuế giá trị gia tăng và Thông tư số 219/2013/TT-BTC của Bộ Tài chính, đặc biệt Khoản 21 Điều 4, và các văn bản sửa đổi, bổ sung;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ nhu cầu sử dụng dịch vụ của Nhà trường (Bên A) và khả năng cung cấp dịch vụ của Bên B;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào sự thỏa thuận của hai bên.</p>

  <p style="margin:10px 0;">Hôm nay, tại trụ sở {{customer_company}}, chúng tôi gồm:</p>

  <!-- Parties A & B Table -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt; text-align:left;" cellpadding="2">
    <colgroup>
      <col style="width:170px">
      <col style="width:220px">
      <col style="width:70px">
      <col style="width:auto">
    </colgroup>

    <!-- Bên A -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên sử dụng dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">{{customer_company}} (sau đây gọi tắt là &ldquo;Nhà trường&rdquo;)</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">{{customer_representative_title}} {{customer_representative}}</td>
      <td style="vertical-align:top; white-space:nowrap; padding-left:15px;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{customer_position}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">{{customer_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;">{{customer_phone}}</td>
      <td style="vertical-align:top; padding-left:15px;">Di động:</td>
      <td style="vertical-align:top;">{{customer_mobile}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">{{customer_tax_code}}</td>
      <td style="vertical-align:top; padding-left:15px;">Email:</td>
      <td style="vertical-align:top;">{{customer_email}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">{{customer_bank_account}}</td>
      <td style="vertical-align:top; padding-left:15px;">tại</td>
      <td style="vertical-align:top;">{{customer_bank_name}}</td>
    </tr>

    <!-- Spacer -->
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>

    <!-- Bên B -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên cung cấp dịch vụ (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">Ông Nguyễn Thanh Tùng</td>
      <td style="vertical-align:top; white-space:nowrap; padding-left:15px;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">Giám đốc</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;"></td>
      <td style="vertical-align:top; padding-left:15px;">Di động:</td>
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
      <td style="vertical-align:top;">Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank) - TTGD Hội sở</td>
    </tr>
  </table>

  <p style="margin:15px 0;">Hai bên cùng thống nhất ký kết Hợp đồng này với các điều khoản sau:</p>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">1</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 1. ĐỐI TƯỢNG VÀ PHẠM VI DỊCH VỤ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cung cấp cho Bên A dịch vụ phát triển phần mềm ứng dụng dạng website trường học (sau đây gọi là &ldquo;Phần mềm&rdquo;), bao gồm nhưng không giới hạn các công việc chính sau:
        <div style="margin-left: 10px; margin-top: 4px; line-height: 1.6;">
          a) Khảo sát, phân tích yêu cầu nghiệp vụ quản lý, cổng thông tin và truyền thông của Nhà trường;<br>
          b) Thiết kế kiến trúc hệ thống, cơ sở dữ liệu và luồng xử lý nghiệp vụ;<br>
          c) Yêu cầu thiết kế giao diện: Giao diện Phần mềm/Website cần chuẩn thiết kế đáp ứng (Responsive) hiển thị tối ưu trên điện thoại di động, máy tính bảng và máy tính để bàn, đảm bảo tiêu chuẩn về khả năng truy cập, thẩm mỹ và trải nghiệm người dùng dành cho Học sinh, Giáo viên, Phụ huynh và Cán bộ quản lý;<br>
          d) Phát triển, lập trình các mô-đun giao diện người dùng, mô-đun xử lý nghiệp vụ, hệ thống quản trị nội dung (CMS) và các chức năng kèm theo theo chi tiết tại {{appendix_list_text}};<br>
          đ) Kiểm thử, hiệu chỉnh, tối ưu hiệu năng và an toàn bảo mật hệ thống;<br>
          e) Triển khai Phần mềm lên môi trường vận hành (production) theo cấu hình hai bên thống nhất;<br>
          g) Bàn giao mã nguồn (source code), cơ sở dữ liệu, tài liệu kỹ thuật hỗ trợ và tài liệu hướng dẫn sử dụng cho Nhà trường.
        </div>
      </td>
    </tr>
    {{clause_1_2_html}}
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_total_value_number}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">{{scope_appendix_ref}}</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_appendix_number}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên thống nhất: Dịch vụ theo Hợp đồng này là sản phẩm phần mềm/dịch vụ phần mềm theo quy định của pháp luật về công nghệ thông tin.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_appendix_number_plus1}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu bổ sung, thay đổi ngoài phạm vi quy định tại các Phụ lục được coi là yêu cầu thay đổi phạm vi công việc và được xử lý theo Điều 6 Hợp đồng này.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 2. GIÁ TRỊ HỢP ĐỒNG, THUẾ GIÁ TRỊ GIA TĂNG VÀ PHƯƠNG THỨC THANH TOÁN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Giá trị hợp đồng:</strong> Tổng giá trị Hợp đồng: <strong>{{total_amount_number}} VNĐ</strong> (Bằng chữ: <em>{{amount_in_words}}</em>). Cơ cấu giá chi tiết theo Phụ lục 01.
      </td>
    </tr>
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">2.2.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Thuế giá trị gia tăng:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên thống nhất: Dịch vụ theo Hợp đồng này thuộc nhóm sản phẩm phần mềm/dịch vụ phần mềm theo Luật Công nghệ thông tin và Nghị định 71/2007/NĐ-CP, thuộc đối tượng không chịu thuế giá trị gia tăng theo Khoản 21 Điều 4 Thông tư 219/2013/TT-BTC. Giá trị Hợp đồng nêu tại Khoản 2.1 là giá trị không chịu thuế GTGT.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp cơ quan thuế có thẩm quyền xác định dịch vụ theo Hợp đồng này phải chịu thuế GTGT, hai bên sẽ lập Phụ lục điều chỉnh giá trị thanh toán tương ứng phần thuế GTGT phát sinh.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tổng giá trị thanh toán:</strong> Tổng giá trị thanh toán Bên A phải thanh toán cho Bên B theo Hợp đồng là: <strong>{{total_amount_number}} VNĐ</strong> (Bằng chữ: <em>{{amount_in_words}}</em>).
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tiến độ thanh toán:</strong> Trừ khi hai bên có thỏa thuận khác bằng văn bản, tiến độ thanh toán được quy định như sau:<br>{{payment_terms}}
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Phương thức thanh toán:</strong> Bên A thanh toán cho Bên B bằng chuyển khoản vào tài khoản ngân hàng sau:<br>
        <table style="margin-left:0; margin-top:4px; border-collapse:collapse; line-height:1.6; font-size:inherit;">
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Tên tài khoản:</td><td style="padding:1px 0 1px 6px;"><strong>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</strong></td></tr>
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Số tài khoản:</td><td style="padding:1px 0 1px 6px;"><strong>86683979</strong></td></tr>
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Ngân hàng:</td><td style="padding:1px 0 1px 6px;"><strong>TMCP Kỹ Thương Việt Nam (Techcombank) – TTGD Hội Sở</strong></td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.6.</td>
      <td style="vertical-align:top; padding:2px 0;">Chậm thanh toán: Theo Điều 301 Luật Thương mại 2005.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 3. TIẾN ĐỘ THỰC HIỆN, NGHIỆM THU VÀ BÀN GIAO</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phân kỳ thực hiện, ngày nghiệm thu chi tiết và sản phẩm bàn giao: Thời hạn thực hiện dự kiến: {{delivery_time}} ngày theo lịch (tính từ ngày Hợp đồng có hiệu lực và Bên B nhận được tạm ứng Đợt 1). Ngày hoàn thành dự kiến: {{end_date}}. Lộ trình triển khai được ghi cụ thể theo từng phân kỳ thực hiện tại Phụ lục 01. Tại từng mốc phân kỳ, Nhà trường (Bên A) tiến hành kiểm thử, nghiệm thu và gửi văn bản/email yêu cầu sửa lỗi (nếu có). Ngày nghiệm thu chi tiết được điều chỉnh tương ứng nếu tiến độ bị ảnh hưởng do Bên A chậm phản hồi hoặc phát sinh thay đổi phạm vi theo Điều 6. Sản phẩm bàn giao bao gồm: Bàn giao mã nguồn (source code), tài liệu hướng dẫn sử dụng, cơ sở dữ liệu và tài liệu kỹ thuật hỗ trợ vận hành hệ thống.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bản dùng thử (Staging): Sau khi hoàn thành bản dùng thử trên môi trường kiểm thử, Bên B thông báo cho Bên A bằng email/văn bản. Bên A có 05 ngày làm việc để kiểm tra và gửi góp ý/yêu cầu sửa lỗi (không quá 03 vòng chỉnh sửa theo phạm vi Phụ lục 01). Nếu quá thời hạn trên Bên A không có ý kiến phản hồi bằng văn bản/email, bản dùng thử được coi là đã được chấp thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nghiệm thu và bàn giao Phần mềm:<br>
      a) Sau khi hoàn thành Phần mềm, Bên B gửi thông báo bàn giao kèm tài khoản kiểm thử cho Bên A. Trong thời hạn 05 ngày làm việc, Nhà trường có trách nhiệm kiểm tra và ký Biên bản nghiệm thu. Lỗi kỹ thuật phát sinh sẽ được Bên B khắc phục miễn phí trong thời gian hợp lý.<br>
      b) Bàn giao đầy đủ: Bên B bàn giao mã nguồn (source code), cơ sở dữ liệu, tài liệu hướng dẫn sử dụng và tài liệu kỹ thuật hỗ trợ sau khi Bên A hoàn thành các nghĩa vụ thanh toán tương ứng theo Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Điều chỉnh tiến độ do lỗi của Bên A: Nếu Bên A chậm cung cấp thông tin, dữ liệu hoặc chậm nghiệm thu, thời hạn thực hiện sẽ được gia hạn tương ứng.</td>
    </tr>
  </table>

  {{warranty_clause_html}}

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nhận đầy đủ các khoản thanh toán theo Điều 2.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thực hiện dịch vụ đúng chất lượng, tiến độ; bàn giao mã nguồn (source code), tài liệu hướng dẫn sử dụng, cơ sở dữ liệu và tài liệu kỹ thuật hỗ trợ cho Nhà trường.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tuân thủ tuyệt đối quy định về bảo mật thông tin và dữ liệu cá nhân tại Điều 7.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên B thực hiện đúng tiến độ, nghiệm thu theo từng phân kỳ và yêu cầu sửa lỗi nếu Phần mềm chưa đạt yêu cầu.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tiếp nhận bàn giao mã nguồn (source code), cơ sở dữ liệu, tài liệu hướng dẫn sử dụng và tài liệu kỹ thuật hỗ trợ.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thanh toán đầy đủ và đúng hạn cho Bên B theo Hợp đồng.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 6. THAY ĐỔI PHẠM VI CÔNG VIỆC</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu thay đổi, bổ sung phạm vi công việc ngoài Phụ lục phải được hai bên thống nhất bằng văn bản/email kèm đề xuất về chi phí và tiến độ.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 7 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">7</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 7. BẢO MẬT THÔNG TIN VÀ DỮ LIỆU CÁ NHÂN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên cam kết giữ bí mật các thông tin nhận được của nhau trong quá trình thực hiện Hợp đồng, trừ khi thông tin đã công khai hoặc phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.</td>
      <td style="vertical-align:top; padding:2px 0;">Bảo mật thông tin và dữ liệu cá nhân (Tuân thủ Nghị định 13/2023/NĐ-CP và Luật An toàn thông tin mạng):</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật thông tin và quyền riêng tư: Bên B cam kết bảo mật tuyệt đối thông tin và quyền riêng tư gồm dữ liệu Học sinh, Giáo viên, Phụ huynh và Nhà trường; triển khai biện pháp kỹ thuật chống tấn công mạng, bảo vệ hệ thống khỏi rò rỉ dữ liệu và thực hiện sao lưu dự phòng (backup) dữ liệu định kỳ đảm bảo an toàn dữ liệu. Bên A là Bên Kiểm soát dữ liệu cá nhân (Data Controller), Bên B là Bên Xử lý dữ liệu cá nhân (Data Processor).</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật mã nguồn và dữ liệu nhà trường: Không được chia sẻ, sao chép hoặc sử dụng dữ liệu của nhà trường vào bất kỳ mục đích nào khác nếu không có sự đồng ý của Bên A bằng văn bản. Dữ liệu của Nhà trường là tài sản sở hữu riêng tuyệt đối của Bên A.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 8 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">8</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 8. SỞ HỮU TRÍ TUỆ VÀ QUYỀN SỬ DỤNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Căn cứ Luật Sở hữu trí tuệ số 50/2005/QH11 (sửa đổi, bổ sung 2022), Nhà trường (Bên A) giữ quyền sở hữu đối với toàn bộ dữ liệu, thông tin, hình ảnh, tài liệu do Bên A cung cấp hoặc tạo ra trên Phần mềm. Sau khi Bên A thanh toán 100% giá trị Hợp đồng, Bên B giao toàn bộ mã nguồn dự án thành phẩm (source code) và quyền sử dụng theo thỏa thuận.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 9 - 14 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">9</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 9. GIỚI HẠN TRÁCH NHIỆM & GIẢI QUYẾT TRANH CHẤP</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi tranh chấp phát sinh từ Hợp đồng trước hết được giải quyết thông qua thương lượng. Hợp đồng này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau.</td>
    </tr>
  </table>

  <!-- Signatures -->
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

  <!-- ========== PHỤ LỤC 01 ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 0 0 6px 0;">Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm {{contract_type}} số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

  <p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">I. DANH MỤC SẢN PHẨM PHẦN MỀM / WEBSITE VÀ SẢN PHẨM BÀN GIAO CHI TIẾT</p>
  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:8pt; table-layout:auto;">
    <tr style="background:#f5f5f5;">
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">STT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:100%;">Hạng mục & Quy cách kỹ thuật</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">ĐVT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">SL</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Đơn giá (chưa VAT)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Thành tiền (chưa VAT)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">VAT(%)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tiền VAT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tổng cộng</th>
    </tr>
    {{contract_items_table}}
    <tr style="background:#f9f9f9;">
      <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold;" colspan="8">Cộng tiền hàng (chưa VAT):</td>
      <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold; white-space:nowrap;">{{subtotal}}</td>
    </tr>
    {{vat_breakdown_html}}
    <tr style="background:#e8e8e8;">
      <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt;" colspan="8">Tổng cộng thanh toán:</td>
      <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt; white-space:nowrap;">{{total_amount_number}} VND</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:4px;" colspan="9">Số tiền viết bằng chữ: <em>{{amount_in_words}}</em></td>
    </tr>
  </table>

  {{proposal_appendix_content_html}}
  <p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">II. CAM KẾT VÀ BÀN GIAO</p>
  <p style="margin: 0 0 15px 0;">Bên B cam kết bàn giao đầy đủ mã nguồn (source code), tài liệu hướng dẫn sử dụng, cơ sở dữ liệu và tài liệu kỹ thuật hỗ trợ cho Nhà trường. Phụ lục này là một phần không tách rời của Hợp đồng số {{contract_number}}.</p>

  <!-- Signatures -->
  <table style="width:100%; margin-top: 20px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top; font-size:9pt;">ĐẠI DIỆN BÊN A</td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top; font-size:9pt;">ĐẠI DIỆN BÊN B</td>
    </tr>
  </table>
</div>
`;

// ==========================================
// 2. DESIGN, MEDIA PRODUCTION & PRINTING TEMPLATE (HĐ 2 - WITH VAT)
// ==========================================
export const contractDesignTemplate = `
<div style="font-family: Arial, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'MS Gothic', sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 0; line-height: 1.5; text-align: justify;">
  <!-- Header: 2 columns -->
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

  <!-- Contract Number & Date -->
  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{contract_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">{{contract_title_upper}}</p>

  <!-- Legal grounds - Italicized -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự số 91/2015/QH13 có hiệu lực từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thương mại số 36/2005/QH11 có hiệu lực từ ngày 01/01/2006 và các văn bản hướng dẫn thi hành;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thuế giá trị gia tăng và các văn bản hướng dẫn thi hành;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ nhu cầu sử dụng dịch vụ của Bên A và khả năng cung cấp dịch vụ của Bên B;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào sự thỏa thuận của hai bên.</p>

  <p style="margin:10px 0;">Hôm nay, tại trụ sở {{customer_company}}, chúng tôi gồm:</p>

  <!-- Parties A & B Table -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt; text-align:left;" cellpadding="2">
    <colgroup>
      <col style="width:170px">
      <col style="width:220px">
      <col style="width:70px">
      <col style="width:auto">
    </colgroup>

    <!-- Bên A -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên sử dụng dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:;">{{customer_company}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">{{customer_representative_title}} {{customer_representative}}</td>
      <td style="vertical-align:top; white-space:nowrap; padding-left:15px;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{customer_position}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">{{customer_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;">{{customer_phone}}</td>
      <td style="vertical-align:top; padding-left:15px;">Di động:</td>
      <td style="vertical-align:top;">{{customer_mobile}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">{{customer_tax_code}}</td>
      <td style="vertical-align:top; padding-left:15px;">Email:</td>
      <td style="vertical-align:top;">{{customer_email}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">{{customer_bank_account}}</td>
      <td style="vertical-align:top; padding-left:15px;">tại</td>
      <td style="vertical-align:top;">{{customer_bank_name}}</td>
    </tr>

    <!-- Spacer -->
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>

    <!-- Bên B -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên cung cấp dịch vụ (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">Ông Nguyễn Thanh Tùng</td>
      <td style="vertical-align:top; white-space:nowrap; padding-left:15px;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">Giám đốc</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;"></td>
      <td style="vertical-align:top; padding-left:15px;">Di động:</td>
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
      <td style="vertical-align:top;">Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank) - TTGD Hội sở</td>
    </tr>
  </table>

  <p style="margin:15px 0;">Hai bên thống nhất ký kết {{contract_title_body}} với các điều khoản sau:</p>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">1</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 1. ĐỐI TƯỢNG VÀ PHẠM VI DỊCH VỤ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cung cấp cho Bên A các sản phẩm, dịch vụ theo thỏa thuận của hai bên. Danh mục hạng mục, yêu cầu kỹ thuật, số lượng, tiêu chuẩn chất lượng, tiến độ thực hiện và sản phẩm bàn giao được quy định chi tiết tại <strong>Phụ lục 01</strong> đính kèm Hợp đồng này.</td>
    </tr>
    {{clause_1_2_html}}
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_total_value_number}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">{{scope_appendix_ref}}</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">{{clause_appendix_number}}</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu ngoài các hạng mục đã nêu tại các Phụ lục được coi là phát sinh và sẽ được hai bên thỏa thuận bằng phụ lục/đề nghị phát sinh riêng và tính phí riêng bổ sung.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 2. GIÁ TRỊ HỢP ĐỒNG, THUẾ GTGT VÀ PHƯƠNG THỨC THANH TOÁN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Giá trị hợp đồng:</strong><br>
        Tổng giá trị Hợp đồng (chưa bao gồm thuế GTGT): <strong>{{subtotal}} VNĐ</strong>.<br>
        Đơn giá từng hạng mục dịch vụ được quy định chi tiết tại các Phụ lục kèm theo.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Thuế giá trị gia tăng (GTGT/VAT):</strong><br>
        Thuế GTGT được áp dụng theo thuế suất GTGT hiện hành đối với từng loại dịch vụ thiết kế, quay chụp, dựng, in ấn tại thời điểm xuất hóa đơn (hiện tại là 8%, trừ khi pháp luật có quy định khác); Thuế GTGT được tính riêng trên hóa đơn cho từng hạng mục dịch vụ theo quy định pháp luật.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tổng giá trị thanh toán:</strong><br>
        Tổng giá trị thanh toán (đã bao gồm thuế GTGT): <strong>{{total_amount_number}} VNĐ</strong><br>
        (Bằng chữ: <em>{{amount_in_words}}</em>).
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tiến độ thanh toán:</strong><br>
        Tiến độ thanh toán chi tiết dựa trên khối lượng công việc được các bên thống nhất như sau:<br>
        {{payment_terms}}
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Phương thức thanh toán:</strong><br>
        Bên A thanh toán cho Bên B bằng chuyển khoản vào tài khoản ngân hàng sau:<br>
        <table style="margin-left:10px; margin-top:4px; border-collapse:collapse; line-height:1.6; font-size:inherit;">
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Tên tài khoản:</td><td style="padding:1px 0 1px 6px;"><strong>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</strong></td></tr>
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Số tài khoản:</td><td style="padding:1px 0 1px 6px;"><strong>86683979</strong></td></tr>
          <tr><td style="padding:1px 0; white-space:nowrap; vertical-align:top;">- Ngân hàng:</td><td style="padding:1px 0 1px 6px;"><strong>TMCP Kỹ Thương Việt Nam (Techcombank) – TTGD Hội Sở</strong></td></tr>
        </table>
        Ngày thanh toán được xác định là ngày tiền được ghi Có vào tài khoản của Bên B.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.6.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Chậm thanh toán:</strong> Nếu Bên A chậm thanh toán bất kỳ khoản nào quá 05 ngày làm việc so với hạn thanh toán, Bên A phải chịu lãi chậm trả với mức 0,05%/ngày tính trên số tiền chậm trả và số ngày chậm trả, nhưng tổng mức phạt và lãi chậm trả không vượt quá 8% giá trị phần nghĩa vụ thanh toán bị vi phạm, phù hợp Điều 301 Luật Thương mại 2005. Nếu Bên A chậm thanh toán quá 15 ngày làm việc, Bên B có quyền tạm dừng thực hiện công việc, kéo dài thời hạn thực hiện tương ứng, và yêu cầu bồi thường thiệt hại thực tế.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 3. NGHIỆM THU DỊCH VỤ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Nghiệm thu thiết kế đồ họa:</strong> Bên B gửi bản thiết kế bản mềm (file JPG/PDF hoặc định dạng tương đương) cho Bên A qua email hoặc phương thức điện tử khác; Bên A có {{design_review_days}} ngày làm việc để góp ý/chỉnh sửa (tối đa {{design_review_rounds}} vòng chỉnh sửa); Khi Bên A xác nhận &ldquo;đồng ý duyệt thiết kế&rdquo; bằng email/văn bản, hoặc sử dụng thiết kế cho mục đích truyền thông, thiết kế được coi là đã nghiệm thu.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Nghiệm thu quay phim, chụp ảnh, dựng video:</strong> Bên B gửi bản xem thử (preview) cho Bên A; Bên A có {{video_review_days}} ngày làm việc để góp ý/chỉnh sửa (tối đa {{video_review_rounds}} vòng chỉnh sửa); Khi Bên A xác nhận bản cuối cùng bằng email/văn bản, hoặc sử dụng video/hình ảnh vào mục đích truyền thông, sản phẩm được coi là đã nghiệm thu.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Nghiệm thu in ấn:</strong> Trước khi in số lượng lớn, nếu hai bên thống nhất, Bên B có thể cung cấp bản in mẫu (proof) hoặc hình ảnh mẫu in để Bên A kiểm tra, xác nhận; Khi giao hàng in ấn, Bên A có trách nhiệm kiểm tra số lượng, quy cách, chất lượng in trong vòng 03 ngày làm việc kể từ ngày nhận hàng; Nếu trong thời hạn trên Bên A không có ý kiến bằng văn bản/email, coi như Bên A đã nghiệm thu toàn bộ lô hàng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Trách nhiệm khi có lỗi:</strong><br>
        a) <strong>Nếu lỗi do Bên B</strong> (in sai file đã được Bên A duyệt, sai quy cách, thiếu số lượng): Bên B có trách nhiệm in lại/khắc phục trong thời hạn hợp lý hoặc giảm giá tương ứng theo thỏa thuận;<br>
        b) <strong>Nếu lỗi do Bên A</strong> (duyệt nội dung sai, cung cấp file sai, chậm phản hồi, chỉ đạo không rõ ràng): Bên A chịu chi phí in lại hoặc các chi phí phát sinh tương ứng.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Thời hạn thực hiện dự kiến:</strong> {{delivery_time}} ngày theo lịch (tính cả ngày bắt đầu và ngày kết thúc), được tính từ ngày Hợp đồng có hiệu lực và Bên B nhận được thanh toán Đợt 1. <strong>Ngày hoàn thành dự kiến:</strong> {{end_date}}. Ngày hoàn thành dự kiến được điều chỉnh tương ứng nếu tiến độ bị ảnh hưởng bởi việc Bên A chậm cung cấp thông tin, xác nhận hoặc thanh toán.{{timeline_appendix_ref}}</td>
    </tr>
  </table>

  {{warranty_clause_html}}

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 4. QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nhận đầy đủ và đúng hạn các khoản thanh toán theo Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên A cung cấp kịp thời, đầy đủ nội dung, hình ảnh, thông tin cần thiết.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Từ chối các yêu cầu ngoài phạm vi Hợp đồng và Phụ lục nếu không có thỏa thuận bổ sung.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tạm dừng thực hiện dịch vụ nếu Bên A chậm thanh toán, không phối hợp hoặc vi phạm nghĩa vụ.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thực hiện dịch vụ đúng phạm vi, chất lượng, tiến độ đã thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.6.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật thông tin theo Điều 7.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên B cung cấp dịch vụ đúng chất lượng, tiến độ, phạm vi đã thống nhất.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Kiểm tra, giám sát tiến độ thực hiện công việc.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thanh toán đầy đủ, đúng hạn các khoản chi phí cho Bên B.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Cung cấp kịp thời, đầy đủ và chịu trách nhiệm hoàn toàn về tính hợp pháp của nội dung, hình ảnh, thông tin, bản quyền tư liệu cung cấp cho Bên B.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phối hợp nghiệm thu, ký biên bản nghiệm thu/bàn giao sản phẩm trong thời hạn quy định.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 6. THAY ĐỔI PHẠM VI CÔNG VIỆC</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi yêu cầu thay đổi, bổ sung phạm vi công việc, tính năng, giao diện, nội dung ngoài những gì đã mô tả trong Phụ lục phải được Bên A gửi cho Bên B bằng văn bản/email.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong vòng 05 ngày làm việc kể từ khi nhận được yêu cầu, Bên B đánh giá tác động đến thời gian, chi phí, kỹ thuật và gửi lại đề xuất cho Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B chỉ triển khai phần phát sinh sau khi hai bên thống nhất bằng văn bản/email về nội dung thay đổi, chi phí và thời gian thực hiện. Nếu hai bên không thống nhất được, Bên B có quyền từ chối thực hiện phần phát sinh đó mà không bị coi là vi phạm Hợp đồng.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 7 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">7</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 7. BẢO MẬT THÔNG TIN</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên cam kết giữ bí mật các thông tin nhận được của nhau trong quá trình thực hiện Hợp đồng, trừ trường hợp pháp luật yêu cầu cung cấp.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Không tiết lộ cho bên thứ ba nếu không có sự đồng ý bằng văn bản của bên còn lại, trừ nhà tư vấn, kiểm toán, luật sư của mình.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 8 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">8</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 8. QUYỀN SỞ HỮU TRÍ TUỆ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B là đơn vị sáng tạo, thiết kế, sản xuất sản phẩm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Sau khi Bên A thanh toán đầy đủ, Bên A được quyền sử dụng sản phẩm (thiết kế, video, ảnh, ấn phẩm in) cho mục đích truyền thông, kinh doanh của mình.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trừ khi có thỏa thuận khác bằng văn bản, Bên B không có nghĩa vụ bàn giao file gốc (AI, PSD, INDD, file dựng gốc…) mà chỉ bàn giao file sử dụng (PDF, JPG, MP4…).</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B có quyền trích dẫn, sử dụng hình ảnh sản phẩm, tên dự án, logo Bên A vào hồ sơ năng lực/portfolio của mình, trừ khi Bên A có yêu cầu bảo mật bằng văn bản.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 9 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">9</td>
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
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B không chịu trách nhiệm đối với thiệt hại gián tiếp, lợi nhuận bị mất, mất cơ hội kinh doanh, tổn thất uy tín của Bên A.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 10 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">10</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 10. VI PHẠM HỢP ĐỒNG VÀ PHẠT VI PHẠM</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên nào vi phạm nghĩa vụ cơ bản gây thiệt hại cho bên kia thì, ngoài việc khắc phục vi phạm, phải bồi thường thiệt hại thực tế (nếu bên bị vi phạm chứng minh được) và chịu phạt vi phạm nếu có thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mức phạt vi phạm (bao gồm phạt chậm tiến độ, chậm thanh toán và các vi phạm khác) không vượt quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm, phù hợp Điều 301 Luật Thương mại 2005.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 11 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">11</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 11. HIỆU LỰC, SỬA ĐỔI VÀ CHẤM DỨT HỢP ĐỒNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng có hiệu lực kể từ ngày đại diện hợp pháp của hai bên ký (và đóng dấu, nếu có) tại văn phòng của Bên A cho đến khi các bên hoàn thành toàn bộ nghĩa vụ, trừ khi chấm dứt trước hạn theo Điều này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi sửa đổi, bổ sung Hợp đồng phải được lập thành văn bản (hoặc email có xác nhận của hai bên) và là bộ phận không tách rời của Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mỗi bên có quyền đơn phương chấm dứt thực hiện Hợp đồng trong các trường hợp:<br>
        a) Bên kia vi phạm nghiêm trọng nghĩa vụ thanh toán, nghĩa vụ bảo mật hoặc nghĩa vụ bàn giao dịch vụ mà không khắc phục trong vòng 15 ngày làm việc kể từ ngày nhận được thông báo bằng văn bản của bên còn lại;<br>
        b) Bên kia lâm vào tình trạng phá sản, giải thể theo quy định pháp luật hoặc không còn khả năng thực hiện Hợp đồng;<br>
        c) Các trường hợp khác theo quy định của pháp luật.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;"><strong>Hậu quả của việc đơn phương chấm dứt Hợp đồng:</strong><br>
        a) <strong>Trường hợp Bên A đơn phương chấm dứt Hợp đồng không do lỗi của Bên B:</strong> Bên B được giữ lại toàn bộ số tiền Bên A đã thanh toán; Bên A có trách nhiệm thanh toán cho Bên B phần giá trị công việc Bên B đã thực hiện nhưng chưa được thanh toán (nếu có), căn cứ trên khối lượng thực tế và báo cáo của Bên B; Hai bên tiến hành thanh lý Hợp đồng, Bên B không phải hoàn trả tiền đã nhận, trừ khi hai bên có thỏa thuận khác bằng văn bản.<br>
        b) <strong>Trường hợp Bên B đơn phương chấm dứt Hợp đồng không do lỗi của Bên A:</strong> Bên B hoàn trả cho Bên A phần tiền đã nhận tương ứng với phần công việc chưa thực hiện; Bên B chịu phạt vi phạm (nếu có thỏa thuận) nhưng tổng mức phạt không vượt quá 8% giá trị phần nghĩa vụ chưa thực hiện bị vi phạm.
      </td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp chấm dứt do sự kiện bất khả kháng hoặc lý do khách quan khác theo thỏa thuận, hai bên sẽ thương lượng để thanh toán phần công việc đã thực hiện; không bên nào phải chịu phạt vi phạm do việc chấm dứt này.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 12 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">12</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 12. SỰ KIỆN BẤT KHẢ KHÁNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Sự kiện bất khả kháng là các sự kiện xảy ra một cách khách quan, không thể lường trước và không thể khắc phục được dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép, như: thiên tai, hỏa hoạn lớn, chiến tranh, bạo loạn, dịch bệnh nguy hiểm được cơ quan nhà nước có thẩm quyền công bố, thay đổi chính sách pháp luật làm cho việc thực hiện Hợp đồng trở nên không thể thực hiện được, và các sự kiện tương tự khác.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên gặp sự kiện bất khả kháng phải thông báo cho bên kia trong thời hạn 05 ngày làm việc kể từ khi xảy ra sự kiện, bằng văn bản/email, nêu rõ: loại sự kiện, mức độ ảnh hưởng, thời gian dự kiến kéo dài; đồng thời nỗ lực áp dụng mọi biện pháp để khắc phục, hạn chế thiệt hại. Hai bên sẽ thương lượng để gia hạn thời gian thực hiện nghĩa vụ hoặc chấm dứt Hợp đồng.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 13 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">13</td>
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
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi tranh chấp phát sinh từ hoặc liên quan đến Hợp đồng trước hết được giải quyết thông qua thương lượng, hòa giải trên tinh thần hợp tác, tôn trọng lẫn nhau trong thời hạn 30 ngày kể từ ngày một bên thông báo tranh chấp.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu hết thời hạn trên mà không giải quyết được, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại Thành phố Hà Nội để giải quyết. Quyết định của Tòa án là quyết định cuối cùng, các bên có nghĩa vụ thi hành. Án phí, lệ phí do bên thua kiện chịu, trừ khi Tòa án có quyết định khác.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 14 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-top:14px; margin-bottom:6px;">
    <tr>
      <td style="width:50px; font-weight:bold; vertical-align:top;">14</td>
      <td style="font-weight:bold; vertical-align:top;">ĐIỀU 14. ĐIỀU KHOẢN CHUNG & PHỤ LỤC HỢP ĐỒNG</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Các Phụ lục kèm theo Hợp đồng này (bao gồm nhưng không giới hạn: Phụ lục phạm vi công việc, Phụ lục bảng giá chi tiết, Phụ lục bổ sung phát sinh…) là bộ phận không tách rời và có giá trị pháp lý như Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp có mâu thuẫn giữa nội dung Hợp đồng và Phụ lục, thì ưu tiên áp dụng nội dung tại Phụ lục mới nhất (được ký sau cùng) đối với phần công việc, giá trị, tiến độ được điều chỉnh. Các nội dung khác không được điều chỉnh trong Phụ lục vẫn áp dụng theo Hợp đồng chính. Việc ký thêm Phụ lục không làm mất hiệu lực của các điều khoản khác trong Hợp đồng, trừ khi các bên có thỏa thuận khác bằng văn bản. Phụ lục có thể lập dưới hình thức văn bản giấy hoặc email có xác nhận của hai bên.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Những vấn đề không được quy định hoặc quy định chưa đầy đủ trong Hợp đồng này sẽ được áp dụng theo quy định của pháp luật Việt Nam hiện hành.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">14.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng gồm {{contract_clause_count}}, kèm theo {{appendix_list_text}}, được lập thành 02 (hai) bản gốc bằng tiếng Việt, mỗi bên giữ 01 (một) bản, có giá trị pháp lý như nhau.</td>
    </tr>
  </table>

  <p style="margin:15px 0; text-align:justify;">Hai bên đã đọc kỹ tất cả các điều khoản của hợp đồng, hiểu rõ quyền lợi và trách nhiệm pháp lý của việc giao kết Hợp đồng này. Đại diện hai bên cam kết có đầy đủ thẩm quyền, tự nguyện ký kết và cam kết thực hiện đúng các nghĩa vụ đã thỏa thuận.</p>

  <!-- Signatures -->
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

  <!-- ========== PHỤ LỤC 01: PHẠM VI CÔNG VIỆC, BẢNG GIÁ & LỘ TRÌNH ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 0 0 6px 0;">Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm {{contract_type}} số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

  <p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">I. DANH MỤC SẢN PHẨM, DỊCH VỤ VÀ IN ẤN CHI TIẾT</p>
  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:8pt; table-layout:auto;">
    <tr style="background:#f5f5f5;">
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">STT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:100%;">Hạng mục & Quy cách (kích thước, định dạng, loại giấy...)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">ĐVT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">SL</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Đơn giá (chưa VAT)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Thành tiền (chưa VAT)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; white-space:nowrap;">VAT(%)</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tiền VAT</th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:right; font-weight:bold; white-space:nowrap;">Tổng cộng</th>
    </tr>
    {{contract_items_table}}
    <tr style="background:#f9f9f9;">
      <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold;" colspan="8">Cộng tiền hàng (chưa VAT):</td>
      <td style="border:1px solid #000; padding:6px 8px; text-align:right; font-weight:bold; white-space:nowrap;">{{subtotal}}</td>
    </tr>
    {{vat_breakdown_html}}
    <tr style="background:#e8e8e8;">
      <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt;" colspan="8">Tổng cộng thanh toán:</td>
      <td style="border:1px solid #000; padding:8px; text-align:right; font-weight:bold; font-size:10pt; white-space:nowrap;">{{total_amount_number}} VND</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:4px;" colspan="9">Số tiền viết bằng chữ: <em>{{amount_in_words}}</em></td>
    </tr>
  </table>

  {{proposal_appendix_content_html}}
  <p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">II. CAM KẾT</p>
  <p style="margin: 0 0 15px 0;">Phụ lục này là một phần không tách rời của Hợp đồng số {{contract_number}}. Các điều khoản về chất lượng, nghiệm thu, thanh toán, phạt vi phạm, bảo mật, sở hữu trí tuệ, giải quyết tranh chấp... được áp dụng theo Hợp đồng chính.</p>

  <!-- Signatures -->
  <table style="width:100%; margin-top: 20px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top; font-size:9pt;">ĐẠI DIỆN BÊN A</td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top; font-size:9pt;">ĐẠI DIỆN BÊN B</td>
    </tr>
  </table>

</div>
`;

// Export the default alias for backward compatibility
export const contractTemplate = contractSoftwareTemplate;
