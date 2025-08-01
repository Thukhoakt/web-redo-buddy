import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
    username: string;
  };
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (postsError) throw postsError;

      // Then get profiles for each author
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', post.author_id)
            .single();

          return {
            ...post,
            profiles: profile || { full_name: '', username: '' }
          };
        })
      );

      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            John Deus
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chia sẻ kiến thức và kinh nghiệm về công nghệ, lập trình và cuộc sống
          </p>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Bài viết mới nhất
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="group hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                        <span className="text-muted-foreground">Không có ảnh</span>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt || 'Không có mô tả...'}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/blog/${post.id}`}>
                        Đọc tiếp
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Chưa có bài viết nào được đăng tải.
              </p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link to="/blog">
                  Xem tất cả bài viết
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
              Về John Deus
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Tôi là một lập trình viên đam mê công nghệ và chia sẻ kiến thức. 
              Qua blog này, tôi muốn chia sẻ những kinh nghiệm, kiến thức và 
              những điều thú vị trong thế giới lập trình và công nghệ.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">React</Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">TypeScript</Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">Node.js</Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">Python</Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">Machine Learning</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;