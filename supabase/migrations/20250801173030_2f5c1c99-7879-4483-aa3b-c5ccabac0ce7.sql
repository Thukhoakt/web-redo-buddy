-- Create documents table for E-learning
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- pdf, doc, video, etc
  is_pinned BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Anyone can view documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage documents" 
ON public.documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for documents updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create email_subscribers table
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on email_subscribers table
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for email_subscribers
CREATE POLICY "Admins can view all subscribers" 
ON public.email_subscribers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can subscribe" 
ON public.email_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage subscribers" 
ON public.email_subscribers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));