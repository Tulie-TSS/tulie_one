export const freelanceTemplate = `
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
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 5px 0;">HỢP ĐỒNG DỊCH VỤ</p>
  <p style="text-align:center; font-size:11pt; margin: 0 0 20px 0;">(KHOÁN VIỆC LẬP TRÌNH)</p>

  <!-- Căn cứ pháp luật - IN NGHIÊNG -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự số 91/2015/QH13 có hiệu lực từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Sở hữu trí tuệ số 50/2005/QH11 đã được sửa đổi, bổ sung bởi Luật số 36/2009/QH12, Luật số 42/2019/QH14 và Luật số 07/2022/QH15;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Công nghệ thông tin số 67/2006/QH11 và Luật An ninh mạng số 24/2018/QH14;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào thỏa thuận tự nguyện và nhu cầu thực tế của các bên.</p>

  <p style="margin:10px 0;">Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại trụ sở Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie, chúng tôi gồm:</p>

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
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên thuê dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
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
      <td style="vertical-align:top;">0989.123.456</td>
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
      <td style="vertical-align:top;">Ngân hàng Techcombank</td>
    </tr>

    <!-- Spacer -->
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>

    <!-- BÊN B -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên thực hiện (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">{{freelancer_name}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Số CCCD/CMND:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{freelancer_cccd}}</td>
      <td style="vertical-align:top; white-space:nowrap;">Ngày cấp:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{cccd_date}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Nơi cấp:</td>
      <td colspan="3" style="vertical-align:top;">{{cccd_place}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Ngày sinh:</td>
      <td colspan="3" style="vertical-align:top;">{{freelancer_dob}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ thường trú:</td>
      <td colspan="3" style="vertical-align:top;">{{freelancer_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">{{freelancer_contact_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;">{{freelancer_phone}}</td>
      <td style="vertical-align:top;">Email:</td>
      <td style="vertical-align:top;">{{freelancer_email}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">{{freelancer_bank_account}}</td>
      <td style="vertical-align:top;">tại</td>
      <td style="vertical-align:top;">{{freelancer_bank_name}}</td>
    </tr>
  </table>

  <p style="margin:10px 0;">Sau khi bàn bạc, thảo luận, hai bên thống nhất ký kết Hợp đồng dịch vụ lập trình website (“Hợp đồng”) với các điều khoản và điều kiện như sau:</p>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top; padding:6px 0;">1</td>
      <td style="font-weight:bold; vertical-align:top; padding:6px 0;">Điều 1: Định nghĩa và giải thích từ ngữ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">"Sản Phẩm": là website, ứng dụng web (webapp), trang đích (landing page) hoặc các thành phần phần mềm, mã nguồn, giao diện, cơ sở dữ liệu và các tài liệu liên quan được Bên B lập trình, phát triển và bàn giao cho Bên A theo các yêu cầu cụ thể được quy định tại Hợp đồng này và các Phụ lục đính kèm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">"Ngày Bàn Giao": là ngày Bên B chính thức hoàn thành và chuyển giao toàn bộ Sản Phẩm cùng các tài liệu liên quan cho Bên A theo đúng các điều khoản đã thỏa thuận và được xác nhận bằng Biên bản Nghiệm thu và Bàn giao.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">"Thông Tin Bảo Mật": bao gồm nhưng không giới hạn ở: (i) các thông tin về khách hàng, đối tác của Bên A; (ii) mã nguồn, tài liệu kỹ thuật, kiến trúc hệ thống, thiết kế của Sản Phẩm; (iii) các ý tưởng, chiến lược kinh doanh, thông tin tài chính, bí mật thương mại của Bên A; và (iv) bất kỳ thông tin nào khác được Bên A chỉ định là thông tin bảo mật, dù ở dạng văn bản, điện tử hay truyền miệng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">"Quyền Sở Hữu Trí Tuệ": là quyền tác giả và các quyền liên quan đối với toàn bộ các thành phần cấu thành nên Sản Phẩm, bao gồm nhưng không giới hạn ở mã nguồn (source code), mã đối tượng (object code), giao diện đồ họa người dùng (GUI), thiết kế, cấu trúc cơ sở dữ liệu, tài liệu kỹ thuật và hướng dẫn sử dụng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">"Lỗi": là bất kỳ sự sai khác, khiếm khuyết hoặc việc Sản Phẩm không hoạt động đúng theo các chức năng, yêu cầu kỹ thuật đã được mô tả và thống nhất trong Phụ lục của Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.6.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">"Ngày Làm Việc": là các ngày trong tuần từ thứ Hai đến thứ Sáu, không bao gồm các ngày nghỉ lễ, Tết theo quy định của pháp luật Việt Nam.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 2: Đối tượng và phạm vi công việc</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Đối tượng của Hợp đồng: Bên B đồng ý cung cấp dịch vụ lập trình và phát triển Sản Phẩm cho Bên A, và Bên A đồng ý thanh toán phí dịch vụ cho Bên B theo các điều khoản và điều kiện của Hợp đồng này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phạm vi công việc: Bên B có trách nhiệm thực hiện các công việc sau đây để tạo ra Sản Phẩm hoàn chỉnh:<br>
      a) Phân tích yêu cầu và tư vấn giải pháp kỹ thuật phù hợp.<br>
      b) Thiết kế cấu trúc cơ sở dữ liệu và kiến trúc hệ thống.<br>
      c) Lập trình giao diện người dùng (Front-end) theo thiết kế được cung cấp hoặc thống nhất.<br>
      d) Lập trình hệ thống xử lý nghiệp vụ (Back-end) và các giao diện lập trình ứng dụng (API).<br>
      e) Kiểm thử (testing) để đảm bảo Sản Phẩm hoạt động ổn định, chính xác và không có Lỗi nghiêm trọng.<br>
      f) Triển khai (deploy) Sản Phẩm lên môi trường máy chủ do Bên A chỉ định.<br>
      g) Hỗ trợ kỹ thuật và sửa Lỗi trong thời gian bảo hành.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu kỹ thuật và sản phẩm bàn giao: Các yêu cầu chi tiết về chức năng, giao diện, công nghệ sử dụng, nền tảng vận hành, và danh mục các sản phẩm cần bàn giao (bao gồm mã nguồn, cơ sở dữ liệu, tài liệu hướng dẫn cài đặt và sử dụng, v.v.) sẽ được quy định cụ thể tại Phụ lục 01 của Hợp đồng, tương ứng với từng dự án cụ thể.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 3: Giá trị hợp đồng và phương thức thanh toán</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Giá trị Hợp đồng:<br>
      a) Tổng giá trị Hợp đồng là: <strong>{{total_amount}} VND</strong> (Bằng chữ: <em>{{amount_in_words}}</em>).<br>
      b) Phí dịch vụ trên là phí khoán việc chưa bao gồm việc khấu trừ 10% thuế TNCN theo quy định pháp luật. Bên A có trách nhiệm khấu trừ 10% thuế TNCN tại nguồn trước khi thực hiện chi trả thực tế cho Bên B và nộp cho cơ quan thuế theo quy định của pháp luật hiện hành.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phương thức thanh toán: Thanh toán bằng hình thức chuyển khoản vào tài khoản ngân hàng của Bên B đã được cung cấp tại phần đầu của Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Lịch trình thanh toán: Giá trị Hợp đồng sẽ được thanh toán thành các đợt như sau:<br>
      a) Đợt 1 (Tạm ứng): Thanh toán <strong>{{deposit_amount}} VND</strong> (tương ứng {{deposit_percent}}% tổng giá trị Hợp đồng) trong vòng 05 Ngày Làm Việc kể từ ngày ký hợp đồng này.<br>
      b) Đợt 2 (Tất toán): Thanh toán phần còn lại tương đương <strong>{{remaining_amount}} VND</strong> (sau khi đã trừ đi 10% thuế TNCN khấu trừ tại nguồn nếu thuộc đối tượng khấu trừ) trong vòng 07 Ngày Làm Việc kể từ ngày hai bên ký Biên bản Nghiệm thu và Bàn giao Sản Phẩm cuối cùng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Đồng tiền thanh toán: Việt Nam Đồng (VND).</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 4: Thời hạn, tiến độ và nghiệm thu</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thời hạn thực hiện Hợp đồng: Hợp đồng có hiệu lực kể từ ngày ký. Thời gian thực hiện dịch vụ dự kiến bắt đầu từ ngày <strong>{{start_date}}</strong> đến ngày <strong>{{end_date}}</strong>, không bao gồm thời gian chờ phản hồi, phê duyệt từ Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tiến độ chi tiết: Các mốc thời gian hoàn thành từng hạng mục công việc, giai đoạn của dự án được quy định chi tiết tại Phụ lục 01 của Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Quy trình nghiệm thu:<br>
      a) Khi hoàn thành một giai đoạn hoặc toàn bộ Sản Phẩm, Bên B sẽ thông báo cho Bên A bằng văn bản hoặc email để tiến hành nghiệm thu.<br>
      b) Bên A có tối đa 05 Ngày Làm Việc để kiểm tra, đưa ra các yêu cầu chỉnh sửa (nếu có). Các yêu cầu chỉnh sửa phải dựa trên các tính năng đã thống nhất trong Phụ lục 01. Các yêu cầu phát sinh ngoài phạm vi sẽ được xem xét như một yêu cầu mới và có thể phát sinh chi phí.<br>
      c) Bên B có trách nhiệm tiếp nhận và hoàn thành các yêu cầu chỉnh sửa hợp lệ trong thời gian thỏa thuận. Quy trình kiểm tra và yêu cầu chỉnh sửa không lặp lại quá 03 lần cho mỗi giai đoạn.<br>
      d) Khi Sản Phẩm đã đáp ứng đầy đủ yêu cầu, hai bên sẽ tiến hành ký Biên bản Nghiệm thu và Bàn giao để xác nhận việc hoàn thành công việc. Đây là cơ sở để Bên A thực hiện thanh toán đợt cuối.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 5: Quyền và nghĩa vụ của Bên A</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nghĩa vụ của Bên A:<br>
      a) Cung cấp đầy đủ, chính xác và kịp thời mọi thông tin, tài liệu, dữ liệu, tài khoản cần thiết để Bên B thực hiện công việc.<br>
      b) Cử người đại diện có đủ thẩm quyền làm đầu mối liên lạc, phối hợp, cung cấp phản hồi và xác nhận các yêu cầu trong suốt quá trình thực hiện dự án.<br>
      c) Phản hồi, duyệt các hạng mục công việc và tiến hành nghiệm thu theo đúng thời hạn quy định tại Điều 4.<br>
      d) Thanh toán đầy đủ và đúng hạn phí dịch vụ cho Bên B theo quy định tại Điều 3.<br>
      e) Chịu trách nhiệm về tính hợp pháp của nội dung, hình ảnh, dữ liệu được sử dụng trên Sản Phẩm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Quyền của Bên A:<br>
      a) Yêu cầu Bên B thực hiện công việc theo đúng tiến độ, chất lượng và phạm vi đã cam kết trong Hợp đồng và Phụ lục.<br>
      b) Được nhận bàn giao đầy đủ Sản Phẩm, bao gồm mã nguồn, cơ sở dữ liệu và các tài liệu liên quan.<br>
      c) Sở hữu toàn bộ Quyền Sở Hữu Trí Tuệ đối với Sản Phẩm sau khi đã hoàn thành đầy đủ nghĩa vụ thanh toán cho Bên B.<br>
      d) Yêu cầu Bên B sửa các Lỗi phát sinh trong thời gian bảo hành.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 6: Quyền và nghĩa vụ của Bên B</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nghĩa vụ của Bên B:<br>
      a) Thực hiện công việc với kỹ năng, sự cẩn trọng và chuyên môn cao nhất, đảm bảo Sản Phẩm đạt chất lượng và tuân thủ các yêu cầu đã thỏa thuận.<br>
      b) Tuân thủ nghiêm ngặt tiến độ thực hiện dự án đã được thống nhất tại Phụ lục.<br>
      c) Bàn giao đầy đủ các sản phẩm theo quy định, bao gồm toàn bộ mã nguồn không mã hóa, không chứa mã độc và có chú thích rõ ràng.<br>
      d) Bảo hành, sửa chữa miễn phí các Lỗi của Sản Phẩm do lỗi lập trình của Bên B trong thời gian 12 tháng kể từ ngày ký Biên bản Nghiệm thu và Bàn giao cuối cùng. Thời gian khắc phục Lỗi không quá 48 giờ làm việc đối với lỗi nghiêm trọng và 05 Ngày Làm Việc đối với lỗi thông thường.<br>
      e) Cam kết không sử dụng các mã nguồn, thư viện vi phạm bản quyền của bên thứ ba trong quá trình phát triển Sản Phẩm.<br>
      f) Tuân thủ nghiêm ngặt các quy định về bảo mật thông tin tại Điều 8 của Hợp đồng.<br>
      g) Thông báo kịp thời cho Bên A về các vấn đề phát sinh có thể ảnh hưởng đến tiến độ hoặc chất lượng của dự án.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">6.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Quyền của Bên B:<br>
      a) Yêu cầu Bên A cung cấp đầy đủ thông tin, tài liệu và phối hợp kịp thời để thực hiện công việc.<br>
      b) Được nhận thanh toán đầy đủ và đúng hạn theo thỏa thuận tại Điều 3.<br>
      c) Có quyền tạm dừng công việc nếu Bên A chậm trễ trong việc cung cấp thông tin cần thiết hoặc chậm thanh toán quá 10 ngày so với thời hạn quy định, sau khi đã có thông báo bằng văn bản/email cho Bên A.<br>
      d) Được quyền ghi tên mình hoặc thương hiệu của mình một cách hợp lý ở phần chân trang (footer) của Sản Phẩm với dòng chữ "Phát triển bởi {{freelancer_name}}" nếu được Bên A đồng ý bằng văn bản.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 7 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">7</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 7: Quyền sở hữu trí tuệ</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cam kết rằng tất cả các sản phẩm do mình tạo ra trong khuôn khổ Hợp đồng này là nguyên bản và không vi phạm Quyền Sở Hữu Trí Tuệ của bất kỳ bên thứ ba nào.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Ngay sau khi Bên A hoàn tất nghĩa vụ thanh toán toàn bộ giá trị Hợp đồng cho Bên B, Bên A sẽ trở thành chủ sở hữu duy nhất và toàn bộ đối với Quyền Sở Hữu Trí Tuệ của Sản Phẩm. Bên A có toàn quyền sử dụng, sao chép, sửa đổi, nâng cấp, chuyển nhượng và khai thác thương mại Sản Phẩm mà không cần có sự chấp thuận thêm của Bên B.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">7.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B không được phép sao chép, tái sử dụng, bán, chuyển giao hoặc tiết lộ mã nguồn của Sản Phẩm cho bất kỳ bên thứ ba nào khác dưới bất kỳ hình thức nào mà không có sự đồng ý trước bằng văn bản của Bên A.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 8 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">8</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 8: Bảo mật thông tin</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Cả hai bên cam kết giữ bí mật tuyệt đối tất cả các Thông Tin Bảo Mật mà mình tiếp cận được từ bên kia trong quá trình thực hiện Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Các bên chỉ được sử dụng Thông Tin Bảo Mật cho mục đích thực hiện các công việc đã thỏa thuận trong Hợp đồng này và không được tiết lộ cho bất kỳ bên thứ ba nào, trừ trường hợp có yêu cầu của cơ quan nhà nước có thẩm quyền hoặc có sự đồng ý bằng văn bản của bên sở hữu thông tin.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">8.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nghĩa vụ bảo mật này có hiệu lực ngay cả sau khi Hợp đồng đã chấm dứt hoặc hết hiệu lực, và kéo dài vô thời hạn kể từ ngày Hợp đồng chấm dứt.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 9 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">9</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 9: Phạt vi phạm và bồi thường thiệt hại</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Vi phạm về tiến độ (do lỗi Bên B): Nếu Bên B chậm hoàn thành bàn giao Sản Phẩm so với tiến độ đã thỏa thuận tại Phụ lục mà không do lỗi Bên A hoặc bất khả kháng, Bên B chịu phạt chậm tiến độ với mức 1% giá trị phần việc bị chậm cho mỗi ngày chậm, nhưng tổng mức phạt không vượt quá 8% giá trị phần nghĩa vụ bị vi phạm (phù hợp Điều 301 Luật Thương mại 2005).</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Vi phạm về thanh toán (do lỗi Bên A): Nếu Bên A chậm thanh toán bất kỳ khoản nào cho Bên B theo lịch trình đã thỏa thuận, Bên A chịu lãi suất chậm trả trên số tiền chậm trả, tính theo lãi suất nợ quá hạn của ngân hàng Techcombank tại thời điểm thanh toán tương ứng với số ngày chậm trả, nhưng tổng mức phạt chậm thanh toán không vượt quá 8% giá trị nghĩa vụ thanh toán bị chậm trả.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Vi phạm về bảo mật và chống lôi kéo: Nếu Bên B vi phạm nghĩa vụ bảo mật tại Điều 8 hoặc điều khoản chống lôi kéo tại Điều 6.1.d, Bên B phải bồi thường toàn bộ thiệt hại thực tế phát sinh và chịu một khoản phạt vi phạm tương đương 20% tổng giá trị Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">9.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Việc áp dụng chế tài phạt vi phạm không làm ảnh hưởng đến quyền yêu cầu bồi thường thiệt hại của bên bị vi phạm.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 10 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">10</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 10: Chấm dứt hợp đồng</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng này chấm dứt trong các trường hợp sau:<br>
      a) Hợp đồng đã được hoàn thành và nghiệm thu thanh lý.<br>
      b) Hai bên thỏa thuận chấm dứt Hợp đồng bằng văn bản.<br>
      c) Một trong hai bên bị giải thể, phá sản theo quy định của pháp luật.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Một bên có quyền đơn phương chấm dứt Hợp đồng bằng cách thông báo trước bằng văn bản/email tối thiểu {{notice_days}} ngày nếu bên kia vi phạm nghiêm trọng nghĩa vụ của mình và không khắc phục vi phạm trong vòng 15 ngày kể từ ngày nhận được thông báo. Vi phạm nghiêm trọng bao gồm:<br>
      a) Bên B chậm tiến độ quá 30 ngày mà không có lý do chính đáng.<br>
      b) Bên A chậm thanh toán quá 30 ngày so với thời hạn quy định.<br>
      c) Một bên vi phạm nghĩa vụ bảo mật thông tin.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">10.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hậu quả pháp lý khi chấm dứt Hợp đồng: Khi Hợp đồng chấm dứt, các bên tiến hành thanh toán cho phần công việc đã được thực hiện và nghiệm thu thực tế. Bên B có trách nhiệm bàn giao lại toàn bộ tài liệu, mã nguồn đã hoàn thành và tài sản của Bên A trong vòng 07 Ngày Làm Việc. Nếu Bên B đơn phương chấm dứt không do lỗi của Bên A, Bên B chịu phạt {{termination_penalty_percent}}% giá trị hợp đồng và hoàn trả toàn bộ số tiền đã tạm ứng trước đó.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 11 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">11</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 11: Bất khả kháng</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Sự kiện bất khả kháng là sự kiện xảy ra một cách khách quan, không thể lường trước được và không thể khắc phục được mặc dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép, bao gồm nhưng không giới hạn: thiên tai, hỏa hoạn, lũ lụt, chiến tranh, dịch bệnh, cấm vận, thay đổi chính sách pháp luật của Nhà nước.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Khi xảy ra sự kiện bất khả kháng, bên bị ảnh hưởng phải thông báo ngay cho bên kia bằng văn bản/email trong vòng 03 ngày. Các bên sẽ không bị coi là vi phạm Hợp đồng nếu không thực hiện được nghĩa vụ của mình do sự kiện bất khả kháng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">11.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nếu sự kiện bất khả kháng kéo dài quá 30 ngày, các bên sẽ cùng nhau thương lượng để tìm giải pháp xử lý. Nếu không đạt được thỏa thuận, một trong hai bên có quyền chấm dứt Hợp đồng mà không phải bồi thường hay chịu phạt.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 12 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">12</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 12: Giải quyết tranh chấp</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Mọi tranh chấp phát sinh từ hoặc liên quan đến Hợp đồng này trước hết sẽ được giải quyết thông qua thương lượng, hòa giải trên tinh thần hợp tác và thiện chí.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong trường hợp không thể giải quyết được tranh chấp thông qua thương lượng trong vòng 30 ngày kể từ ngày phát sinh tranh chấp, một trong hai bên có quyền đưa vụ việc ra giải quyết tại Tòa án nhân dân có thẩm quyền tại Hà Nội, Việt Nam.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">12.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Luật áp dụng để giải quyết tranh chấp là pháp luật Việt Nam. Phán quyết của Tòa án là cuối cùng và có giá trị ràng buộc đối với cả hai bên.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 13 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">13</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 13: Điều khoản chung</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hiệu lực của Hợp đồng: Hợp đồng này có hiệu lực kể từ ngày ký của cả hai bên.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Sửa đổi, bổ sung: Mọi sửa đổi, bổ sung đối với Hợp đồng này phải được lập thành văn bản dưới dạng phụ lục và có chữ ký của đại diện có thẩm quyền của cả hai bên. Các phụ lục là một phần không thể tách rời của Hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">13.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản. Hai bên đã đọc kỹ, hiểu rõ và đồng ý với toàn bộ nội dung của Hợp đồng và cùng nhau ký tên dưới đây.</td>
    </tr>
  </table>

  <p style="margin:12px 0; text-align:justify;">Hai bên đã đọc kỹ tất cả các điều khoản của hợp đồng, hiểu rõ quyền lợi và trách nhiệm pháp lý của việc giao kết Hợp đồng này. Tại thời điểm ký kết, hai bên đều có năng lực pháp luật và năng lực hành vi dân sự đầy đủ.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 30px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">
        ĐẠI DIỆN BÊN B<br>
        <span style="font-weight:normal; font-style:italic;">(Ký, ghi rõ họ tên)</span>
      </td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">
        ĐẠI DIỆN BÊN A<br>
        <span style="font-weight:normal; font-style:italic;">(Ký, đóng dấu, ghi rõ họ tên)</span>
      </td>
    </tr>
    <tr>
      <td style="height:80px;"></td>
      <td style="height:80px;"></td>
    </tr>
    <tr>
      <td style="text-align:center; font-weight:bold;">{{freelancer_name}}</td>
      <td style="text-align:center; font-weight:bold;">Nguyễn Thanh Tùng</td>
    </tr>
  </table>

  <!-- ========== PHỤ LỤC 01: BẢNG HẠNG MỤC CHI TIẾT ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 20px 0 10px 0;">PHỤ LỤC 01 — BẢNG HẠNG MỤC CÔNG VIỆC</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm Hợp đồng dịch vụ lập trình số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

  <p style="font-weight:bold; margin: 10px 0 5px 0;">1. Tên Sản Phẩm/Dự án: <span style="font-weight:normal;">{{project_name}}</span></p>
  <p style="font-weight:bold; margin: 10px 0 10px 0;">2. Chi tiết hạng mục và phí dịch vụ:</p>

  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:9pt; table-layout:auto;">
    <tr style="background:#f5f5f5;">
      <th style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:bold; white-space:nowrap; width:40px;">STT</th>
      <th style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:bold; width:100%;">Tên hạng mục & Yêu cầu chi tiết</th>
      <th style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:bold; white-space:nowrap; width:60px;">ĐVT</th>
      <th style="border:1px solid #000; padding:6px 4px; text-align:center; font-weight:bold; white-space:nowrap; width:50px;">SL</th>
      <th style="border:1px solid #000; padding:6px 4px; text-align:right; font-weight:bold; white-space:nowrap; width:100px;">Đơn giá</th>
      <th style="border:1px solid #000; padding:6px 4px; text-align:right; font-weight:bold; white-space:nowrap; width:120px;">Thành tiền</th>
    </tr>
    {{contract_items_table_no_vat}}
    <tr style="background:#e8e8e8;">
      <td style="border:1px solid #000; padding:8px 6px; font-size:10pt;" colspan="5"><strong>Tổng phí dịch vụ (VND)</strong></td>
      <td style="border:1px solid #000; padding:8px 6px; text-align:right; font-weight:bold; font-size:10pt; white-space:nowrap;">{{total_amount_number}}</td>
    </tr>
  </table>
  <p style="text-align:justify; font-style:italic; font-size:9pt; margin-top:5px;">
    Ghi chú: Bảng giá trị trên là phí khoán việc chưa bao gồm việc khấu trừ 10% thuế TNCN theo quy định tại Điều 3 của Hợp đồng.
  </p>

</div>
`;;
