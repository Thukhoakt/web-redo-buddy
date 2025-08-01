import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  tags: string[];
  profiles: {
    full_name: string;
    username: string;
  };
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchTags();
    
    // Get tag from URL params
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(post =>
        post.tags && post.tags.some(tag => 
          tag.toLowerCase().replace(/\s+/g, '-') === selectedTag ||
          tag.toLowerCase() === selectedTag
        )
      );
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedTag, posts]);

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

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const getTagBySlug = (slug: string) => {
    return tags.find(tag => tag.slug === slug);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {selectedTag ? (getTagBySlug(selectedTag)?.name || selectedTag) : 'Blog'}
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {selectedTag 
              ? `Bài viết về ${getTagBySlug(selectedTag)?.name || selectedTag}`
              : 'Khám phá những bài viết mới nhất về công nghệ, lập trình và nhiều chủ đề thú vị khác'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
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
            
            {/* Tag Filter */}
            <div className="md:w-64">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">Tất cả danh mục</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active filters */}
          {(selectedTag || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTag && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTag("")}
                  className="text-xs"
                >
                  {getTagBySlug(selectedTag)?.name || selectedTag} ×
                </Button>
              )}
              {searchTerm && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="text-xs"
                >
                  "{searchTerm}" ×
                </Button>
              )}
            </div>
          )}
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
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
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
              {searchTerm || selectedTag 
                ? 'Không tìm thấy bài viết nào phù hợp với bộ lọc của bạn.' 
                : 'Chưa có bài viết nào được đăng tải.'
              }
            </p>
            {(searchTerm || selectedTag) && (
              <div className="mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTag("");
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
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