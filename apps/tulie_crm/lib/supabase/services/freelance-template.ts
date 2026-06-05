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
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam số 91/2015/QH13 được Quốc hội thông qua ngày 24/11/2015 có hiệu lực thi hành từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ nhu cầu và thỏa thuận giữa hai bên.</p>

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

  <p style="margin:10px 0;">Sau khi bàn bạc và thỏa thuận, hai bên đã thống nhất những nội dung như sau:</p>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top; padding:6px 0;">1</td>
      <td style="font-weight:bold; vertical-align:top; padding:6px 0;">Điều 1: Nội dung công việc và chất lượng</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B nhận khoán thực hiện cho Bên A dự án/công việc: <strong>{{project_name}}</strong>. Nội dung chi tiết các hạng mục được quy định cụ thể tại <strong>Phụ lục 01</strong> đính kèm hợp đồng này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu chất lượng: Sản phẩm bàn giao phải bao gồm đầy đủ mã nguồn gốc (Source Code) (nếu có), đạt tiêu chuẩn kỹ thuật yêu cầu, không có lỗi nghiêm trọng và tuân thủ đúng thời hạn (deadline).</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 2: Thời gian và địa điểm thực hiện</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td><td style="vertical-align:top; padding:2px 0;">Thời gian thực hiện: Từ ngày {{start_date}} đến ngày {{end_date}}.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.2.</td><td style="vertical-align:top; padding:2px 0;">Địa điểm thực hiện: Làm việc từ xa (Remote) hoặc theo thỏa thuận khác.</td></tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 3: Phí dịch vụ, thuế TNCN và thanh toán</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:4px;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td><td style="vertical-align:top; padding:2px 0;">Tổng phí dịch vụ khoán việc:</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:4px; margin-left:50px;">
    <tr><td style="width:80px;">Bằng số:</td><td style="font-weight:bold;">{{total_amount}} VND</td></tr>
    <tr><td>Bằng chữ:</td><td><em>{{amount_in_words}}</em></td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Thuế Thu nhập cá nhân (TNCN): Bên A có trách nhiệm thực hiện khấu trừ Thuế TNCN 10% tại nguồn đối với khoản thu nhập này (áp dụng cho các khoản chi trả từ 2.000.000 VNĐ trở lên/lần) trước khi chi trả thực tế cho Bên B theo quy định pháp luật.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td><td style="vertical-align:top; padding:2px 0;">Thời hạn thanh toán:</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;"></td><td style="vertical-align:top; padding:2px 0; text-align:justify;">- <strong>Đợt 1 (Tạm ứng):</strong> Thanh toán {{deposit_amount}} VNĐ (tương đương {{deposit_percent}}%) sau khi ký hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;"></td><td style="vertical-align:top; padding:2px 0; text-align:justify;">- <strong>Đợt 2 (Tất toán):</strong> Thanh toán phần còn lại sau khi hai bên ký biên bản nghiệm thu bàn giao và đã trừ đi khoản thuế TNCN (nếu có).</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td><td style="vertical-align:top; padding:2px 0;">Hình thức thanh toán: Chuyển khoản vào tài khoản ngân hàng của Bên B như đã nêu ở phần thông tin Bên B.</td></tr>
  </table>

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 4: Quyền sở hữu trí tuệ và bảo mật thông tin</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Quyền sở hữu trí tuệ: Toàn bộ mã nguồn, tài liệu và sản phẩm công việc tạo ra trong khuôn khổ hợp đồng này thuộc quyền sở hữu duy nhất của Bên A. Bên B không được quyền sử dụng, sao chép hoặc chuyển giao cho bất kỳ bên thứ ba nào nếu không có sự đồng ý bằng văn bản của Bên A.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật: Bên B cam kết bảo mật tuyệt đối các thông tin kinh doanh, kỹ thuật, dữ liệu khách hàng của Bên A. Trong trường hợp vi phạm bảo mật hoặc vi phạm quyền sở hữu trí tuệ, Bên B phải bồi thường thiệt hại tối thiểu là 100.000.000 VNĐ.</td></tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 5: Đơn phương chấm dứt hợp đồng</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bất kỳ bên nào đơn phương chấm dứt hợp đồng không do lỗi của bên kia thì phải bồi thường một khoản bằng {{termination_penalty_percent}}% giá trị hợp đồng.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong trường hợp muốn đơn phương chấm dứt, bên yêu cầu phải thông báo trước bằng văn bản (hoặc email) cho bên kia tối thiểu {{notice_days}} ngày.</td></tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 6: Điều khoản chung</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Đây là hợp đồng dịch vụ khoán việc dân sự, không thiết lập quan hệ lao động, không thuộc phạm vi điều chỉnh của Luật Lao động và không phát sinh các nghĩa vụ về bảo hiểm xã hội, bảo hiểm y tế.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">6.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên cam kết thực hiện nghiêm túc các điều khoản đã thỏa thuận. Mọi tranh chấp phát sinh sẽ được giải quyết trước tiên qua thương lượng. Nếu không giải quyết được sẽ đưa ra Tòa án nhân dân có thẩm quyền tại Hà Nội.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">6.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản. Hợp đồng có hiệu lực kể từ ngày hai bên ký tên.</td></tr>
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
      <td style="height:100px;"></td>
      <td style="height:100px;"></td>
    </tr>
    <tr>
      <td style="text-align:center; font-weight:bold;"></td>
      <td style="text-align:center; font-weight:bold;"></td>
    </tr>
  </table>

  <!-- ========== PHỤ LỤC 01: BẢNG HẠNG MỤC CHI TIẾT ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 20px 0 10px 0;">PHỤ LỤC 01 — BẢNG HẠNG MỤC CÔNG VIỆC</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm Hợp đồng dịch vụ số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

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
