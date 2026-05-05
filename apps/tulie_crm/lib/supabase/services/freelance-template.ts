export const freelanceTemplate = `
<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <strong style="font-size: 13pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
    <strong style="font-size: 12pt; border-bottom: 1px solid #000; padding-bottom: 5px;">Độc lập - Tự do - Hạnh phúc</strong>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <strong style="font-size: 15pt;">HỢP ĐỒNG DỊCH VỤ</strong><br>
    <span style="font-size: 11pt;">(KHOÁN VIỆC LẬP TRÌNH)</span><br>
    <span style="font-size: 11pt;">Số: {{contract_number}}/2026/HĐDV-TL</span>
  </div>

  <div style="margin-bottom: 15px; font-style: italic; font-size: 11pt;">
    - Căn cứ Bộ luật Dân sự 2015 số 91/2015/QH13 và các văn bản hướng dẫn thi hành;<br>
    - Căn cứ nhu cầu và thỏa thuận giữa các bên.
  </div>

  <p>Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại trụ sở Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie, các bên bao gồm:</p>

  <div style="margin-bottom: 20px;">
    <strong>BÊN A: CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE (Bên Thuê)</strong><br>
    Địa chỉ trụ sở: Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Hà Nội.<br>
    Mã số thuế: 0110163102<br>
    Đại diện là Ông: <strong>Nguyễn Thanh Tùng</strong> - Chức vụ: Giám đốc.<br>
    Số điện thoại: 0989.123.456<br>
    Số tài khoản: 86683979 tại Ngân hàng Techcombank
  </div>

  <div style="margin-bottom: 20px;">
    <strong>BÊN B: {{freelancer_name}} (Bên Thực Hiện)</strong><br>
    Số CCCD: {{freelancer_cccd}} cấp ngày {{cccd_date}} tại {{cccd_place}}<br>
    Ngày sinh: {{freelancer_dob}}<br>
    Địa chỉ thường trú: {{freelancer_address}}<br>
    Địa chỉ liên hệ: {{freelancer_contact_address}}<br>
    Số điện thoại: {{freelancer_phone}} - Email: {{freelancer_email}}<br>
    Số tài khoản ngân hàng: {{freelancer_bank_account}} tại {{freelancer_bank_name}}
  </div>

  <p>Sau khi bàn bạc và thỏa thuận, hai bên đã thống nhất những nội dung như sau:</p>

  <strong>ĐIỀU 1. NỘI DUNG CÔNG VIỆC VÀ CHẤT LƯỢNG</strong>
  <div style="margin-bottom: 15px;">
    1. Bên B nhận khoán thực hiện cho Bên A dự án: <strong>{{project_name}}</strong>. Nội dung chi tiết quy định tại Phụ lục 01.<br>
    2. <strong>Yêu cầu chất lượng:</strong> Sản phẩm bàn giao phải bao gồm đầy đủ mã nguồn gốc (Source Code), đạt tiêu chuẩn kỹ thuật, không có lỗi nghiêm trọng và tuân thủ đúng deadline.
  </div>

  <strong>ĐIỀU 2. THỜI GIAN VÀ ĐỊA ĐIỂM</strong>
  <div style="margin-bottom: 15px;">
    2.1. Thời gian thực hiện: Từ ngày {{start_date}} đến ngày {{end_date}}.<br>
    2.2. Địa điểm thực hiện: Làm việc từ xa (Remote).
  </div>

  <strong>ĐIỀU 3. PHÍ DỊCH VỤ, THUẾ TNCN VÀ THANH TOÁN</strong>
  <div style="margin-bottom: 15px;">
    3.1. Phí dịch vụ trọn gói: <strong>{{total_amount}} VNĐ</strong>.<br>
    3.2. <strong>Thuế TNCN:</strong> Bên A thực hiện khấu trừ Thuế TNCN 10% tại nguồn đối với khoản thu nhập này (cho các khoản chi trả từ 2.000.000 VNĐ trở lên) trước khi chi trả cho Bên B.<br>
    3.3. Thời hạn thanh toán:<br>
    - Đợt 1 (Tạm ứng): {{deposit_amount}} VNĐ ({{deposit_percent}}%) sau khi ký hợp đồng.<br>
    - Đợt 2 (Tất toán): Thanh toán phần còn lại sau khi nghiệm thu và đã trừ thuế TNCN.
  </div>

  <strong>ĐIỀU 4. QUYỀN SỞ HỮU TRÍ TUỆ VÀ BẢO MẬT</strong>
  <div style="margin-bottom: 15px;">
    4.1. <strong>Sở hữu trí tuệ:</strong> Toàn bộ mã nguồn và sản phẩm công việc thuộc sở hữu duy nhất của Bên A. Bên B không được quyền sử dụng hoặc sao chép cho mục đích khác.<br>
    4.2. <strong>Bảo mật:</strong> Bên B cam kết bảo mật tuyệt đối thông tin. Vi phạm bảo mật hoặc IP phải bồi thường tối thiểu <strong>100.000.000 VNĐ</strong>.
  </div>

  <strong>ĐIỀU 5. ĐƠN PHƯƠNG CHẤM DỨT HỢP ĐỒNG</strong>
  <div style="margin-bottom: 15px;">
    5.1. Bên đơn phương chấm dứt không do lỗi của bên kia phải bồi thường {{termination_penalty_percent}}% giá trị hợp đồng.<br>
    5.2. Thời hạn báo trước tối thiểu: {{notice_days}} ngày.
  </div>

  <strong>ĐIỀU 6. ĐIỀU KHOẢN CHUNG</strong>
  <div style="margin-bottom: 15px;">
    6.1. Đây là hợp đồng dịch vụ khoán việc, không thiết lập quan hệ lao động.<br>
    6.2. Hợp đồng lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.
  </div>

  <table style="width:100%; margin-top:40px; border-collapse:collapse; border:none;">
    <tr>
      <td style="width:50%; text-align:center; border:none; vertical-align:top;">
        <strong>ĐẠI DIỆN BÊN B</strong><br>
        <em>(Ký, ghi rõ họ tên)</em>
        <div style="height:80px;"></div>
        <br>
        <strong>{{freelancer_name}}</strong>
      </td>
      <td style="width:50%; text-align:center; border:none; vertical-align:top;">
        <strong>ĐẠI DIỆN BÊN A</strong><br>
        <em>(Ký, đóng dấu, ghi rõ họ tên)</em>
        <div style="height:80px;"></div>
        <br>
        <strong>NGUYỄN THANH TÙNG</strong>
      </td>
    </tr>
  </table>
</div>
`;
