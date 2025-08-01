-- Cấp quyền admin cho user deetapchoi@gmail.com (ID từ auth logs: 388ad15a-cedb-4048-8562-4c63a1012b0c)
INSERT INTO public.user_roles (user_id, role)
VALUES ('388ad15a-cedb-4048-8562-4c63a1012b0c', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Cập nhật function để tự động cấp admin cho deetapchoi@gmail.com thay vì johnduy.it@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'phone'
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Tự động cấp quyền admin cho deetapchoi@gmail.com
  IF NEW.email = 'deetapchoi@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;