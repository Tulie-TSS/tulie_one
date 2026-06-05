export const freelanceDeliveryTemplate = `
<div style="font-family: Arial, 'Noto Sans JP', sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; line-height: 1.5; text-align: justify;">
  <!-- Header -->
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

  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{report_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">BIÊN BẢN GIAO NHẬN SẢN PHẨM/DỊCH VỤ</p>

  <!-- Căn cứ -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ vào Hợp đồng dịch vụ số {{contract_number}} ngày {{day}}/{{month}}/{{year}} được ký giữa Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie và Ông/Bà {{freelancer_name}};</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào tiến độ thực hiện và kết quả công việc thực tế của Bên B.</p>

  <p style="margin:10px 0;">Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại văn phòng Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie, chúng tôi gồm có:</p>

  <!-- Bên A + Bên B (cùng 1 bảng) -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;" cellpadding="2">
    <colgroup><col style="width:210px"><col style="width:auto"><col style="width:80px"><col style="width:auto"></colgroup>
    
    <!-- BÊN NHẬN (BÊN A) -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 20px 4px 0; vertical-align:top; white-space:nowrap;">Bên nhận bàn giao (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top;">Ông Nguyễn Thanh Tùng</td>
      <td style="vertical-align:top;">Chức vụ:</td>
      <td style="vertical-align:top;">Giám đốc</td>
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
    
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>
    
    <!-- BÊN GIAO (BÊN B) -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 20px 4px 0; vertical-align:top; white-space:nowrap;">Bên bàn giao (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">{{freelancer_name}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số CCCD/CMND:</td>
      <td style="vertical-align:top;">{{freelancer_cccd}}</td>
      <td style="vertical-align:top;">Ngày cấp:</td>
      <td style="vertical-align:top;">{{cccd_date}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ thường trú:</td>
      <td colspan="3" style="vertical-align:top;">{{freelancer_address}}</td>
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

  <p style="margin:10px 0; font-weight:bold;">Hai bên cùng thống nhất số lượng và nội dung bàn giao hạng mục công việc như sau:</p>

  <!-- Bảng giao nhận -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 14px;">
    <tr>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:40px;">STT</th>
      <th style="border:1px solid #000; padding:5px; text-align:left; font-weight:bold;" colspan="3">Hạng mục công việc / Sản phẩm bàn giao</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:80px;">ĐVT</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:60px;">Số lượng</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold;" colspan="2">Ghi chú</th>
    </tr>
    {{delivery_items_table}}
  </table>

  <p style="margin:10px 0; text-align:justify;">Bên A xác nhận Bên B đã bàn giao đầy đủ sản phẩm, kết quả công việc đạt yêu cầu chất lượng của Bên A theo đúng thỏa thuận tại Hợp đồng.</p>
  <p style="margin:10px 0; text-align:justify;">Biên bản Giao nhận này là căn cứ để hai bên thực hiện thủ tục nghiệm thu, thanh lý hợp đồng và thanh toán phí dịch vụ đợt tiếp theo.</p>
  <p style="margin:10px 0; text-align:justify;">Biên bản được lập thành hai (02) bản có giá trị pháp lý như nhau, mỗi Bên giữ một (01) bản.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 30px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold;">ĐẠI DIỆN BÊN A</td>
      <td style="width:50%; text-align:center; font-weight:bold;">ĐẠI DIỆN BÊN B</td>
    </tr>
    <tr><td style="height:100px;"></td><td style="height:100px;"></td></tr>
  </table>
</div>
`;
