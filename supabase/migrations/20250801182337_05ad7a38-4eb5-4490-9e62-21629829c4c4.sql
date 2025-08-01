-- Cấp quyền admin cho user hiện tại (deetapchoi@gmail.com)
-- User ID: 388ad15a-cedb-4048-8562-4c63a1012b0c

-- Đảm bảo user có role admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('388ad15a-cedb-4048-8562-4c63a1012b0c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Đảm bảo user có role user
INSERT INTO public.user_roles (user_id, role)
VALUES ('388ad15a-cedb-4048-8562-4c63a1012b0c', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Kiểm tra roles của user
SELECT ur.role, u.email 
FROM public.user_roles ur 
JOIN auth.users u ON u.id = ur.user_id 
WHERE ur.user_id = '388ad15a-cedb-4048-8562-4c63a1012b0c';