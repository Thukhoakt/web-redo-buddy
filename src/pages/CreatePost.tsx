import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Upload } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const CreatePost = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  // Check authentication and admin status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      
      setUser(session.user);
      
      // Check admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .limit(1);
        
      if (!error && data && data.length > 0) {
        setIsAdmin(true);
        fetchTags();
      } else {
        toast({
          title: "Không có quyền truy cập",
          description: "Bạn cần quyền admin để tạo bài viết.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    };
    
    checkAuth();
  }, [navigate, toast]);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false,
  });


  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
    } else {
      setAvailableTags(data || []);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let featuredImage = "";
      if (imageFile) {
        featuredImage = await uploadImage(imageFile) || "";
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          author_id: user.id,
          published: formData.published,
          featured_image: featuredImage,
          tags: selectedTags,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bài viết đã được tạo",
        description: formData.published ? "Bài viết đã được xuất bản." : "Bài viết đã được lưu dưới dạng bản nháp.",
      });

      navigate("/blog");
    } catch (error: any) {
      toast({
        title: "Lỗi tạo bài viết",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tạo bài viết mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Mô tả ngắn gọn về bài viết..."
                  rows={3}
                />
              </div>

              {/* Featured Image */}
              <div>
                <Label htmlFor="image">Ảnh đại diện</Label>
                <div className="mt-2">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn ảnh đại diện
                  </Button>
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Nhãn</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag.name)}
                      style={{ 
                        backgroundColor: selectedTags.includes(tag.name) ? tag.color : undefined,
                        borderColor: tag.color 
                      }}
                    >
                      {tag.name}
                      {selectedTags.includes(tag.name) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Viết nội dung bài viết..."
                  rows={15}
                  required
                />
              </div>

              {/* Publish Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Xuất bản ngay</Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang xử lý..." : formData.published ? "Xuất bản" : "Lưu nháp"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/blog")}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;