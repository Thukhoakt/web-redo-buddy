import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, Search } from "lucide-react";
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

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchTerm, posts]);

  const fetchPosts = async () => {
    try {
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Blog
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá những bài viết mới nhất về công nghệ, lập trình và nhiều chủ đề thú vị khác
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Posts Grid */}
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
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
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
              {searchTerm ? `Không tìm thấy bài viết nào với từ khóa "${searchTerm}"` : 'Chưa có bài viết nào được đăng tải.'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="mt-4"
              >
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {filteredPosts.length > 0 && filteredPosts.length % 6 === 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Tải thêm bài viết
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;