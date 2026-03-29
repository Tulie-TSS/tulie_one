-- ============================================================
-- VAS TT200 Chart of Accounts — Seed Data
-- Standard accounts for Vietnamese enterprises
-- Run after migration, user_id should be replaced with actual user
-- ============================================================

-- This function seeds the VAS TT200 chart of accounts for a given user
CREATE OR REPLACE FUNCTION seed_vas_chart_of_accounts(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Clear existing system accounts for this user
  DELETE FROM acc_accounts WHERE user_id = target_user_id AND is_system_account = true;

  -- LOẠI 1: TÀI SẢN NGẮN HẠN
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('111', 'Tiền mặt', 'Cash on hand', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('112', 'Tiền gửi ngân hàng', 'Cash at banks', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('131', 'Phải thu của khách hàng', 'Accounts receivable', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('133', 'Thuế GTGT được khấu trừ', 'VAT deductible', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('136', 'Phải thu nội bộ', 'Inter-company receivables', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('138', 'Phải thu khác', 'Other receivables', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('141', 'Tạm ứng', 'Advances', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('152', 'Nguyên liệu, vật liệu', 'Raw materials', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('153', 'Công cụ, dụng cụ', 'Tools and supplies', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('154', 'Chi phí SXKD dở dang', 'Work in progress', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('155', 'Thành phẩm', 'Finished goods', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id),
    ('156', 'Hàng hóa', 'Merchandise', 'ASSET', 'GROUP_1', 'DEBIT', 1, true, target_user_id);

  -- LOẠI 2: TÀI SẢN DÀI HẠN
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('211', 'Tài sản cố định hữu hình', 'Tangible fixed assets', 'ASSET', 'GROUP_2', 'DEBIT', 1, true, target_user_id),
    ('212', 'Tài sản cố định thuê tài chính', 'Finance lease assets', 'ASSET', 'GROUP_2', 'DEBIT', 1, true, target_user_id),
    ('213', 'Tài sản cố định vô hình', 'Intangible fixed assets', 'ASSET', 'GROUP_2', 'DEBIT', 1, true, target_user_id),
    ('214', 'Hao mòn TSCĐ', 'Accumulated depreciation', 'CONTRA_ASSET', 'GROUP_2', 'CREDIT', 1, true, target_user_id),
    ('241', 'Xây dựng cơ bản dở dang', 'Construction in progress', 'ASSET', 'GROUP_2', 'DEBIT', 1, true, target_user_id),
    ('242', 'Chi phí trả trước', 'Prepaid expenses', 'ASSET', 'GROUP_2', 'DEBIT', 1, true, target_user_id);

  -- LOẠI 3: NỢ PHẢI TRẢ
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('331', 'Phải trả cho người bán', 'Accounts payable', 'LIABILITY', 'GROUP_3', 'CREDIT', 1, true, target_user_id),
    ('333', 'Thuế và các khoản phải nộp NN', 'Taxes payable', 'LIABILITY', 'GROUP_3', 'CREDIT', 1, true, target_user_id),
    ('334', 'Phải trả người lao động', 'Payroll payable', 'LIABILITY', 'GROUP_3', 'CREDIT', 1, true, target_user_id),
    ('335', 'Chi phí phải trả', 'Accrued expenses', 'LIABILITY', 'GROUP_3', 'CREDIT', 1, true, target_user_id),
    ('338', 'Phải trả, phải nộp khác', 'Other payables', 'LIABILITY', 'GROUP_3', 'CREDIT', 1, true, target_user_id),
    ('341', 'Vay và nợ thuê tài chính', 'Borrowings', 'LIABILITY', 'GROUP_3', 'CREDIT', 1, true, target_user_id);

  -- LOẠI 4: VỐN CHỦ SỞ HỮU
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('411', 'Vốn đầu tư của chủ sở hữu', 'Owner equity', 'EQUITY', 'GROUP_4', 'CREDIT', 1, true, target_user_id),
    ('421', 'Lợi nhuận sau thuế chưa phân phối', 'Retained earnings', 'EQUITY', 'GROUP_4', 'CREDIT', 1, true, target_user_id);

  -- LOẠI 5: DOANH THU
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('511', 'Doanh thu bán hàng và cung cấp DV', 'Revenue', 'REVENUE', 'GROUP_5', 'CREDIT', 1, true, target_user_id),
    ('515', 'Doanh thu hoạt động tài chính', 'Financial income', 'REVENUE', 'GROUP_5', 'CREDIT', 1, true, target_user_id),
    ('521', 'Các khoản giảm trừ doanh thu', 'Revenue deductions', 'CONTRA_REVENUE', 'GROUP_5', 'DEBIT', 1, true, target_user_id);

  -- LOẠI 6: CHI PHÍ SXKD
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('621', 'Chi phí nguyên vật liệu trực tiếp', 'Direct materials', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('622', 'Chi phí nhân công trực tiếp', 'Direct labor', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('623', 'Chi phí sử dụng máy thi công', 'Machine costs', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('627', 'Chi phí sản xuất chung', 'Manufacturing overhead', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('632', 'Giá vốn hàng bán', 'Cost of goods sold', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('635', 'Chi phí tài chính', 'Financial expenses', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('641', 'Chi phí bán hàng', 'Selling expenses', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id),
    ('642', 'Chi phí quản lý doanh nghiệp', 'G&A expenses', 'EXPENSE', 'GROUP_6', 'DEBIT', 1, true, target_user_id);

  -- LOẠI 7 & 8: THU NHẬP KHÁC & CHI PHÍ KHÁC
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('711', 'Thu nhập khác', 'Other income', 'REVENUE', 'GROUP_7', 'CREDIT', 1, true, target_user_id),
    ('811', 'Chi phí khác', 'Other expenses', 'EXPENSE', 'GROUP_8', 'DEBIT', 1, true, target_user_id),
    ('821', 'Chi phí thuế TNDN', 'CIT expense', 'EXPENSE', 'GROUP_8', 'DEBIT', 1, true, target_user_id);

  -- LOẠI 9: XÁC ĐỊNH KQKD
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, is_system_account, user_id)
  VALUES
    ('911', 'Xác định kết quả kinh doanh', 'P&L summary', 'EQUITY', 'GROUP_9', 'CREDIT', 1, true, target_user_id);

  -- Now set parent_id for sub-accounts
  -- Add sub-accounts for key accounts
  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '1111', 'Tiền Việt Nam', 'VND cash', 'ASSET', 'GROUP_1', 'DEBIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '111' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '1112', 'Ngoại tệ', 'Foreign currencies', 'ASSET', 'GROUP_1', 'DEBIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '112' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '1331', 'Thuế GTGT được khấu trừ của HH/DV', 'VAT deductible on goods', 'ASSET', 'GROUP_1', 'DEBIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '133' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '3331', 'Thuế GTGT phải nộp', 'VAT payable', 'LIABILITY', 'GROUP_3', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '333' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '3334', 'Thuế TNDN', 'Corporate Income Tax', 'LIABILITY', 'GROUP_3', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '333' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '3335', 'Thuế TNCN', 'Personal Income Tax', 'LIABILITY', 'GROUP_3', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '333' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '3383', 'BHXH', 'Social Insurance payable', 'LIABILITY', 'GROUP_3', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '338' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '3384', 'BHYT', 'Health Insurance payable', 'LIABILITY', 'GROUP_3', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '338' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '3386', 'BHTN', 'Unemployment Insurance', 'LIABILITY', 'GROUP_3', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '338' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '5111', 'Doanh thu bán hàng hóa', 'Revenue from goods', 'REVENUE', 'GROUP_5', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '511' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '5112', 'Doanh thu bán thành phẩm', 'Revenue from finished goods', 'REVENUE', 'GROUP_5', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '511' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '5113', 'Doanh thu cung cấp dịch vụ', 'Revenue from services', 'REVENUE', 'GROUP_5', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '511' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '4211', 'LNST chưa PP năm trước', 'Prior year retained earnings', 'EQUITY', 'GROUP_4', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '421' AND user_id = target_user_id;

  INSERT INTO acc_accounts (account_number, name, name_en, account_type, account_group, normal_balance, level, parent_id, is_system_account, user_id)
  SELECT '4212', 'LNST chưa PP năm nay', 'Current year retained earnings', 'EQUITY', 'GROUP_4', 'CREDIT', 2, id, true, target_user_id
  FROM acc_accounts WHERE account_number = '421' AND user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
