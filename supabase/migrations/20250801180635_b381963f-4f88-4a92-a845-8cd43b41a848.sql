-- Xóa user johnduy.it@gmail.com và tất cả dữ liệu liên quan
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'johnduy.it@gmail.com'
);

DELETE FROM public.profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'johnduy.it@gmail.com'
);

-- Cập nhật function handle_new_user để tự động cấp quyền admin cho johnduy.it@gmail.com
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
  
  -- Tự động cấp quyền admin cho johnduy.it@gmail.com
  IF NEW.email = 'johnduy.it@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;