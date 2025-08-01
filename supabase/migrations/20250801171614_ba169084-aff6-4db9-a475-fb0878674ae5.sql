-- Add tags column to posts table
ALTER TABLE public.posts ADD COLUMN tags TEXT[];

-- Create index for better performance on tags
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);

-- Create a tags table for better management  
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
CREATE POLICY "Anyone can view tags" 
ON public.tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tags" 
ON public.tags 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for tags updated_at
CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default tags
INSERT INTO public.tags (name, slug, description, color) VALUES
  ('React', 'react', 'Thư viện JavaScript để xây dựng giao diện người dùng', '#61dafb'),
  ('TypeScript', 'typescript', 'Ngôn ngữ lập trình được phát triển bởi Microsoft', '#3178c6'),
  ('Node.js', 'nodejs', 'Môi trường runtime JavaScript phía server', '#339933'),
  ('Python', 'python', 'Ngôn ngữ lập trình đa năng', '#3776ab'),
  ('Machine Learning', 'machine-learning', 'Trí tuệ nhân tạo và học máy', '#ff6b6b'),
  ('Web Development', 'web-development', 'Phát triển ứng dụng web', '#4ecdc4'),
  ('Tutorial', 'tutorial', 'Hướng dẫn và bài học', '#45b7d1'),
  ('Tips & Tricks', 'tips-tricks', 'Mẹo và thủ thuật lập trình', '#96ceb4');