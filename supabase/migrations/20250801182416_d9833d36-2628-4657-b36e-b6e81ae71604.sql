-- Cấp quyền admin cho user deetapchoi@gmail.com với ID đúng
-- User ID: 96cec14f-d2ea-4055-8345-f9debdae53bd

INSERT INTO public.user_roles (user_id, role)
VALUES ('96cec14f-d2ea-4055-8345-f9debdae53bd', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('96cec14f-d2ea-4055-8345-f9debdae53bd', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Cấp quyền admin cho admin@johndeus.com luôn
INSERT INTO public.user_roles (user_id, role)
VALUES ('d3263ff0-08ec-4adb-ae0e-a0399591d38b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('d3263ff0-08ec-4adb-ae0e-a0399591d38b', 'user')
ON CONFLICT (user_id, role) DO NOTHING;