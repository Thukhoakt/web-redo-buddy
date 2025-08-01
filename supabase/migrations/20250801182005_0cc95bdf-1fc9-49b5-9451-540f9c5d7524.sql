-- Tạo tài khoản admin hoàn chỉnh
-- Tạo user admin với email: admin@johndeus.com, password: Admin123!

-- Note: Không thể tạo auth user trực tiếp từ SQL, chỉ có thể chuẩn bị dữ liệu

-- Thay vào đó, tạo một edge function để tạo admin user
CREATE OR REPLACE FUNCTION public.setup_admin_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  result json;
BEGIN
  -- Tạo UUID cho admin user
  admin_user_id := gen_random_uuid();
  
  -- Insert profile cho admin
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (admin_user_id, 'John Deus Admin', 'admin_johndeus')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username;
  
  -- Cấp quyền admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  result := json_build_object(
    'admin_user_id', admin_user_id,
    'email', 'admin@johndeus.com',
    'password', 'Admin123!',
    'message', 'Admin setup prepared'
  );
  
  RETURN result;
END;
$$;

-- Chạy function để tạo admin
SELECT public.setup_admin_user();