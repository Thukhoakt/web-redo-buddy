-- Add HTML content field to documents table
ALTER TABLE public.documents 
ADD COLUMN html_content TEXT;

-- Grant admin role to deetapchoi@gmail.com
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID for deetapchoi@gmail.com
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'deetapchoi@gmail.com';
    
    -- Insert admin role if user exists
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_uuid, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;