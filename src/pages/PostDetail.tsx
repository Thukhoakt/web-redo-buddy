import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  tags: string[];
  profiles: {
    full_name: string;
    username: string;
  };
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('published', true)
        .single();

      if (postError) {
        if (postError.code === 'PGRST116') {
          setError("Bài viết không tồn tại hoặc chưa được xuất bản.");
        } else {
          throw postError;
        }
        return;
      }

      // Get author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', postData.author_id)
        .single();

      setPost({
        ...postData,
        profiles: profile || { full_name: '', username: '' }
      });
    } catch (error: any) {
      console.error('Error fetching post:', error);
      setError("Có lỗi xảy ra khi tải bài viết.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-4/6 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {error || "Không tìm thấy bài viết"}
              </h1>
              <Button asChild>
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại Blog
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại Blog
            </Link>
          </Button>
        </div>

        {/* Post Content */}
        <Card>
          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{post.profiles?.full_name || post.profiles?.username || 'Ẩn danh'}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              {post.updated_at !== post.created_at && (
                <span className="text-xs">
                  (Cập nhật: {format(new Date(post.updated_at), 'dd/MM/yyyy', { locale: vi })})
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="pt-4">
                <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
                  {post.excerpt}
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Related Posts or Back to Blog */}
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/blog">
              Xem thêm bài viết khác
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;