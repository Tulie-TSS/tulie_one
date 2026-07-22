/**
 * Biên bản giao nhận - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie
 */
export const deliveryMinutesTemplate = `
<div style="font-family: Arial, 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'MS Gothic', sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; line-height: 1.5; text-align: justify;">
  <!-- Header -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 0;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:top; padding:0;">
        CÔNG TY TNHH DỊV VỤ VÀ GIẢI PHÁP<br>
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

  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0; text-transform: ;">BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO SẢN PHẨM/DỊCH VỤ</p>

  <!-- Căn cứ -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Hợp đồng dịch vụ số {{contract_number}} đã ký kết giữa Bên A và Bên B;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ {{appendix_list_text}} đính kèm Hợp đồng;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào kết quả triển khai thực tế và sự đồng ý nghiệm thu của hai bên.</p>

  <p style="margin:10px 0;">Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại văn phòng khách hàng, chúng tôi gồm:</p>

  <!-- Bên A + Bên B (cùng 1 bảng) -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;" cellpadding="2">
    <colgroup><col style="width:210px"><col style="width:auto"><col style="width:80px"><col style="width:auto"></colgroup>
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 20px 4px 0; vertical-align:top; white-space:nowrap;">Bên sử dụng dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:;">{{customer_company}}</td>
    </tr>
    <tr><td style="vertical-align:top;">Người đại diện pháp luật:</td><td style="font-weight:bold; vertical-align:top;">{{customer_representative_title}} {{customer_representative}}</td><td style="vertical-align:top;">Chức vụ:</td><td style="vertical-align:top;">{{customer_position}}</td></tr>
    <tr><td style="vertical-align:top;">Địa chỉ liên hệ:</td><td colspan="3" style="vertical-align:top;">{{customer_address}}</td></tr>
    <tr><td style="vertical-align:top;">Điện thoại:</td><td style="vertical-align:top;">{{customer_phone}}</td><td style="vertical-align:top;">Di động:</td><td style="vertical-align:top;">{{customer_mobile}}</td></tr>
    <tr><td style="vertical-align:top;">Mã số thuế:</td><td style="vertical-align:top;">{{customer_tax_code}}</td><td style="vertical-align:top;">Email:</td><td style="vertical-align:top;">{{customer_email}}</td></tr>
    <tr><td style="vertical-align:top;">Số tài khoản:</td><td style="vertical-align:top;">{{customer_bank_account}}</td><td style="vertical-align:top;">tại</td><td style="vertical-align:top;">{{customer_bank_name}}</td></tr>
    
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>
    
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 20px 4px 0; vertical-align:top; white-space:nowrap;">Bên cung cấp dịch vụ (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr><td style="vertical-align:top;">Đại diện pháp luật:</td><td style="font-weight:bold; vertical-align:top;">Ông Nguyễn Thanh Tùng</td><td style="vertical-align:top;">Chức vụ:</td><td style="vertical-align:top;">Giám đốc</td></tr>
    <tr><td style="vertical-align:top;">Địa chỉ liên hệ:</td><td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
    <tr><td style="vertical-align:top;">Điện thoại:</td><td style="vertical-align:top;"></td><td style="vertical-align:top;">Di động:</td><td style="vertical-align:top;">+84 98 898 4554</td></tr>
    <tr><td style="vertical-align:top;">Mã số thuế:</td><td style="vertical-align:top;">0110163102</td><td style="vertical-align:top;">Email:</td><td style="vertical-align:top;">info@tulie.vn</td></tr>
    <tr><td style="vertical-align:top;">Số tài khoản:</td><td style="vertical-align:top;">86683979</td><td style="vertical-align:top;">tại</td><td style="vertical-align:top;">Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank) - TTGD Hội sở</td></tr>
  </table>

  <p style="margin:10px 0; font-weight:bold;">1. Nội dung bàn giao chi tiết:</p>
  <table style="width:100%; border-collapse:collapse; margin-bottom: 14px;">
    <tr style="background: #f5f5f5;">
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:40px;">STT</th>
      <th style="border:1px solid #000; padding:5px; text-align:left; font-weight:bold;" colspan="3">Nội dung sản phẩm / Dịch vụ</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:80px;">ĐVT</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:60px;">Số lượng</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold;" colspan="2">Ghi chú</th>
    </tr>
    {{delivery_items_table}}
  </table>

  <p style="margin:10px 0; font-weight:bold;">2. Kết quả kiểm thử và nghiệm thu kỹ thuật:</p>
  <table style="width:100%; border-collapse:collapse; margin-bottom: 12px; font-size:9.5pt;">
    <tr>
      <td style="width:220px; padding:4px 0; font-weight:bold;">- Thiết kế và giao diện (UI/UX):</td>
      <td style="padding:4px 0;">[  ] Đạt yêu cầu kỹ thuật & Responsive</td>
    </tr>
    <tr>
      <td style="font-weight:bold; padding:4px 0;">- Chức năng hệ thống (Feature):</td>
      <td style="padding:4px 0;">[  ] Đạt yêu cầu vận hành theo hợp đồng</td>
    </tr>
    <tr>
      <td style="font-weight:bold; padding:4px 0;">- Quản trị nội dung (CMS/Backend):</td>
      <td style="padding:4px 0;">[  ] Đạt yêu cầu cập nhật & Phân quyền</td>
    </tr>
    <tr>
      <td style="font-weight:bold; padding:4px 0;">- Tối ưu SEO & Tốc độ tải trang:</td>
      <td style="padding:4px 0;">[  ] Đạt chỉ số cam kết (Lighthouse Performance)</td>
    </tr>
  </table>

  <p style="margin:6px 0; text-align:justify; font-style:italic;">
    * Ghi chú các lỗi/chỉnh sửa nhỏ cần khắc phục (nếu có): .....................................................................................................<br>
    Hai bên thống nhất các lỗi nhỏ này không ảnh hưởng đến nghiệm thu bàn giao chính thức. Bên B cam kết khắc phục trong vòng 05 ngày làm việc.
  </p>

  <p style="margin:10px 0; font-weight:bold;">3. Thông tin tài khoản và tài liệu đã bàn giao:</p>
  <ul style="margin:0 0 14px 20px; padding:0; text-align:justify;">
    <li>Địa chỉ website hoạt động chính thức (URL): <strong>{{delivery_address}}</strong></li>
    <li>Quyền quản trị hệ thống (Admin CMS / Dashboard): Đã gửi tài khoản và mật khẩu tạm thời bằng email/chat an toàn.</li>
    <li>Tài liệu kỹ thuật và Hướng dẫn sử dụng CMS: Bản mềm PDF và Video hướng dẫn sử dụng chi tiết.</li>
    <li>Mã nguồn sản phẩm (Source Code): Đã bàn giao đầy đủ mã nguồn không mã hóa qua Git repository / Cloud link.</li>
    <li>Cấu hình liên kết các nền tảng bên thứ ba (Google GA4, Search Console, GTM, Domain/DNS/Hosting).</li>
  </ul>

  <p style="margin:10px 0; font-weight:bold;">4. Kết luận và Nghĩa vụ thanh toán tiếp theo:</p>
  <p style="margin:6px 0; text-align:justify;">
    - Bên A đồng ý chính thức nghiệm thu toàn bộ website để đưa vào hoạt động kinh doanh kể từ ngày ký biên bản này.
  </p>
  <p style="margin:6px 0; text-align:justify;">
    - Trách nhiệm bảo hành kỹ thuật của Bên B sẽ bắt đầu được tính kể từ ngày ký biên bản này theo đúng thời hạn quy định tại Hợp đồng.
  </p>
  <p style="margin:6px 0; text-align:justify;">
    - Bên A chịu trách nhiệm thanh toán nốt đợt cuối (50% giá trị hợp đồng còn lại, tương đương: <strong>{{payment_amount}}</strong>) cho Bên B trong vòng 07 ngày làm việc kể từ ngày ký Biên bản này, phù hợp với tiến độ quy định tại Hợp đồng.
  </p>

  <p style="margin:14px 0 10px 0; text-align:justify;">Biên bản nghiệm thu bàn giao được lập thành hai (02) bản gốc có giá trị pháp lý như nhau, mỗi bên giữ một (01) bản.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 35px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">
        ĐẠI DIỆN BÊN A<br>
        <span style="font-weight:normal; font-style:italic; font-size:9pt;">(Ký, ghi rõ họ tên, đóng dấu)</span>
      </td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">
        ĐẠI DIỆN BÊN B<br>
        <span style="font-weight:normal; font-style:italic; font-size:9pt;">(Ký, ghi rõ họ tên, đóng dấu)</span>
      </td>
    </tr>
    <tr><td style="height:80px;"></td><td style="height:80px;"></td></tr>
  </table>
</div>
`;
