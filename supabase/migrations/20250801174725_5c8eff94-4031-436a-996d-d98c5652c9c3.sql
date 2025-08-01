-- Grant admin role to johnduy.it@gmail.com
-- First, we need to find the user ID for johnduy.it@gmail.com from auth.users
-- Since we can't directly query auth.users in migrations, we'll create a function to handle this

-- Create a function to grant admin role by email
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(user_email text)
RETURNS void AS $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get user ID from auth.users (this requires service role)
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert admin role for the user
        INSERT INTO public.user_roles (user_id, role)
        VALUES (user_uuid, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant admin role to johnduy.it@gmail.com
SELECT public.grant_admin_by_email('johnduy.it@gmail.com');

-- Create table for saved posts
CREATE TABLE public.saved_posts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    saved_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- Enable RLS on saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_posts
CREATE POLICY "Users can view their own saved posts" 
ON public.saved_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON public.saved_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their posts" 
ON public.saved_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add reading_time column to posts
ALTER TABLE public.posts 
ADD COLUMN reading_time integer DEFAULT 5;

-- Insert sample posts from Medium style content
INSERT INTO public.posts (title, content, excerpt, author_id, published, reading_time, tags) 
SELECT 
    'Tầm quan trọng của việc học liên tục trong ngành công nghệ',
    'Trong thế giới công nghệ thay đổi không ngừng, việc học liên tục không chỉ là một lựa chọn mà là một điều kiện tiên quyết để tồn tại và phát triển. Những công nghệ mới xuất hiện hàng ngày, và những kỹ năng mà chúng ta học hôm nay có thể trở nên lỗi thời trong vài năm tới.

## Tại sao việc học liên tục lại quan trọng?

**1. Thị trường lao động cạnh tranh cao**
Ngành công nghệ là một trong những ngành có tính cạnh tranh cao nhất hiện nay. Các nhà tuyển dụng luôn tìm kiếm những ứng viên có kỹ năng mới nhất và cập nhật với xu hướng công nghệ hiện tại.

**2. Công nghệ phát triển nhanh chóng**
Từ AI, Machine Learning đến Blockchain và Cloud Computing, các công nghệ mới liên tục được phát triển và ứng dụng rộng rãi. Nếu không cập nhật, chúng ta sẽ nhanh chóng bị tụt lại phía sau.

**3. Tăng cơ hội thăng tiến**
Những người luôn học hỏi và cập nhật kiến thức mới thường có nhiều cơ hội thăng tiến hơn trong sự nghiệp.

## Cách học hiệu quả

- **Đặt mục tiêu rõ ràng**: Xác định những kỹ năng cụ thể cần học
- **Học theo dự án**: Áp dụng kiến thức vào các dự án thực tế
- **Tham gia cộng đồng**: Kết nối với những người cùng chí hướng
- **Thực hành thường xuyên**: Lý thuyết mà không có thực hành sẽ nhanh chóng bị quên

Hãy nhớ rằng, việc học không bao giờ kết thúc. Đó chính là điều làm nên sự thú vị và thách thức của ngành công nghệ.',
    'Khám phá tầm quan trọng của việc học liên tục trong ngành công nghệ và cách để duy trì khả năng cạnh tranh trong thị trường lao động hiện đại.',
    (SELECT id FROM public.user_roles WHERE role = 'admin'::app_role LIMIT 1),
    true,
    3,
    ARRAY['Công nghệ', 'Học tập', 'Sự nghiệp']
FROM public.user_roles 
WHERE role = 'admin'::app_role 
LIMIT 1;

INSERT INTO public.posts (title, content, excerpt, author_id, published, reading_time, tags)
SELECT 
    '5 thói quen tăng năng suất cho lập trình viên',
    'Là một lập trình viên, việc duy trì năng suất cao không chỉ giúp hoàn thành công việc hiệu quả mà còn tạo ra sự hài lòng trong công việc. Dưới đây là 5 thói quen đã được chứng minh giúp tăng năng suất đáng kể.

## 1. Technique Pomodoro

Chia công việc thành các khoảng thời gian 25 phút tập trung cao độ, sau đó nghỉ 5 phút. Kỹ thuật này giúp duy trì sự tập trung và tránh burnout.

**Cách thực hiện:**
- Chọn một nhiệm vụ cụ thể
- Đặt timer 25 phút
- Làm việc không bị gián đoạn
- Nghỉ 5 phút khi timer kết thúc
- Lặp lại quy trình

## 2. Code Review thường xuyên

Việc review code không chỉ giúp phát hiện lỗi sớm mà còn là cơ hội học hỏi từ đồng nghiệp.

## 3. Sử dụng công cụ tự động hóa

Đầu tư thời gian vào việc tự động hóa các tác vụ lặp đi lặp lại sẽ tiết kiệm rất nhiều thời gian trong tương lai.

**Một số công cụ hữu ích:**
- CI/CD pipelines
- Code formatters
- Automated testing
- Deployment scripts

## 4. Học cách nói "Không"

Biết từ chối những yêu cầu không cần thiết hoặc không khẩn cấp giúp tập trung vào những công việc quan trọng nhất.

## 5. Duy trì work-life balance

Nghỉ ngơi đầy đủ và có thời gian cho bản thân giúp duy trì sự sáng tạo và động lực làm việc.

Hãy nhớ rằng, năng suất không phải về việc làm nhiều hơn, mà là về việc làm đúng những gì quan trọng nhất.',
    'Khám phá 5 thói quen đơn giản nhưng hiệu quả giúp lập trình viên tăng năng suất và duy trì chất lượng công việc cao.',
    (SELECT id FROM public.user_roles WHERE role = 'admin'::app_role LIMIT 1),
    true,
    4,
    ARRAY['Năng suất', 'Lập trình', 'Kỹ năng mềm']
FROM public.user_roles 
WHERE role = 'admin'::app_role 
LIMIT 1;