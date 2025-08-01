import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, ArrowLeft, Bookmark, BookmarkCheck, Share2, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

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
  reading_time?: number;
  profiles: {
    full_name: string;
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPost(id);
      fetchComments(id);
    }
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user && id) {
      checkIfSaved(user.id, id);
    }
  };

  const checkIfSaved = async (userId: string, postId: string) => {
    const { data } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    setIsSaved(!!data);
  };

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

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile || { full_name: '', username: '' }
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: id,
          user_id: user.id
        });

      if (error) throw error;

      setNewComment("");
      if (id) fetchComments(id);
      
      toast({
        title: "Thành công",
        description: "Bình luận đã được thêm!",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm bình luận",
        variant: "destructive",
      });
    }
  };

  const handleSavePost = async () => {
    if (!user || !id) return;

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', id);

        if (error) throw error;
        setIsSaved(false);
        
        toast({
          title: "Đã bỏ lưu",
          description: "Bài viết đã được bỏ khỏi danh sách lưu",
        });
      } else {
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            user_id: user.id,
            post_id: id
          });

        if (error) throw error;
        setIsSaved(true);
        
        toast({
          title: "Đã lưu",
          description: "Bài viết đã được thêm vào danh sách lưu",
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu bài viết",
        variant: "destructive",
      });
    }
  };

  const handleSharePost = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Đã sao chép",
          description: "Link bài viết đã được sao chép vào clipboard",
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể sao chép link",
          variant: "destructive",
        });
      }
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
              {post.reading_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.reading_time} phút đọc</span>
                </div>
              )}
              {post.updated_at !== post.created_at && (
                <span className="text-xs">
                  (Cập nhật: {format(new Date(post.updated_at), 'dd/MM/yyyy', { locale: vi })})
                </span>
              )}
            </div>

            {/* Action Buttons */}
            {user && (
              <div className="flex items-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePost}
                  className="flex items-center gap-2"
                >
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {isSaved ? 'Đã lưu' : 'Lưu bài viết'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSharePost}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </Button>
              </div>
            )}

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
              {post.content.split('\n').map((paragraph, index) => {
                // Handle markdown-style headings
                if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold mb-6 mt-8 text-foreground">
                      {paragraph.substring(2)}
                    </h1>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-bold mb-4 mt-6 text-foreground">
                      {paragraph.substring(3)}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-bold mb-4 mt-6 text-foreground">
                      {paragraph.substring(4)}
                    </h3>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={index} className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                      {paragraph.substring(2)}
                    </blockquote>
                  );
                }
                if (paragraph.startsWith('```')) {
                  return (
                    <pre key={index} className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                      <code className="text-foreground">{paragraph}</code>
                    </pre>
                  );
                }
                if (paragraph.match(/^\d+\./)) {
                  return (
                    <p key={index} className="mb-2 text-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={index} className="list-disc list-inside mb-4">
                      <li className="text-foreground leading-relaxed">{paragraph.substring(2)}</li>
                    </ul>
                  );
                }
                if (paragraph.trim() === '') {
                  return <div key={index} className="h-4"></div>;
                }
                return (
                  <p key={index} className="mb-4 text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="mt-8">
          <CardHeader>
            <h3 className="text-xl font-bold">Bình luận ({comments.length})</h3>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="mb-6">
                <Textarea
                  placeholder="Viết bình luận của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                />
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                >
                  Gửi bình luận
                </Button>
              </div>
            ) : (
              <div className="mb-6 text-center py-4 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-2">
                  Bạn cần đăng nhập để bình luận
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">Đăng nhập</Link>
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">
                        {comment.profiles?.full_name || comment.profiles?.username || 'Ẩn danh'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </p>
              )}
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