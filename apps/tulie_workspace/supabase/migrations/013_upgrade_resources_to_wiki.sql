-- Migration: 013_upgrade_resources_to_wiki.sql
-- Description: Transform resources into a hierarchical Wiki system with granular permissions
-- Date: 2026-05-09

-- 1. Thêm các cột phục vụ Wiki và Bảo mật
ALTER TABLE workspace_resources 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES workspace_resources(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS security_level VARCHAR(20) DEFAULT 'internal' CHECK (security_level IN ('public', 'internal', 'confidential', 'restricted')),
ADD COLUMN IF NOT EXISTS allowed_roles user_role[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS linked_resources UUID[] DEFAULT '{}';

-- 2. Xóa các chính sách RLS cũ để thay thế bằng hệ thống phân quyền mới
DROP POLICY IF EXISTS "Users can view resources of their organization" ON workspace_resources;
DROP POLICY IF EXISTS "Admins and Managers can manage resources" ON workspace_resources;

-- 3. Chính sách SELECT: Phân quyền đa tầng
-- Admin/Manager xem được tất cả
-- Maker chỉ xem được tài liệu 'public', 'internal' HOẶC tài liệu mà role của họ nằm trong allowed_roles
CREATE POLICY "Wiki Access Policy" 
    ON workspace_resources FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND (
                role_type IN ('admin', 'manager') -- Quyền tối cao
                OR (
                    organization_id = workspace_resources.organization_id -- Cùng tổ chức
                    AND (
                        workspace_resources.security_level IN ('public', 'internal') -- Tài liệu thông thường
                        OR role_type = ANY(workspace_resources.allowed_roles) -- Được cấp quyền riêng
                    )
                )
            )
        )
    );

-- 4. Chính sách Manage (INSERT/UPDATE/DELETE)
-- Chỉ Admin và Manager được phép tạo/sửa Wiki
CREATE POLICY "Wiki Management Policy" 
    ON workspace_resources FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role_type IN ('admin', 'manager')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() 
            AND role_type IN ('admin', 'manager')
        )
    );
