import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

const TagManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "#3b82f6",
  });

  useEffect(() => {
    checkUserRole();
    fetchTags();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn cần quyền admin để quản lý tags.",
        variant: "destructive",
      });
      navigate("/");
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
    } catch (error: any) {
      toast({
        title: "Lỗi tải tags",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      if (editingTag) {
        const { error } = await supabase
          .from('tags')
          .update({
            name: formData.name,
            slug,
            description: formData.description,
            color: formData.color,
          })
          .eq('id', editingTag.id);

        if (error) throw error;
        
        toast({
          title: "Cập nhật thành công",
          description: "Tag đã được cập nhật.",
        });
      } else {
        const { error } = await supabase
          .from('tags')
          .insert({
            name: formData.name,
            slug,
            description: formData.description,
            color: formData.color,
          });

        if (error) throw error;
        
        toast({
          title: "Tạo thành công",
          description: "Tag mới đã được tạo.",
        });
      }

      setIsDialogOpen(false);
      setEditingTag(null);
      setFormData({ name: "", slug: "", description: "", color: "#3b82f6" });
      fetchTags();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
      color: tag.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tag này?")) return;

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      
      toast({
        title: "Xóa thành công",
        description: "Tag đã được xóa.",
      });
      
      fetchTags();
    } catch (error: any) {
      toast({
        title: "Lỗi xóa tag",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNewTag = () => {
    setEditingTag(null);
    setFormData({ name: "", slug: "", description: "", color: "#3b82f6" });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Quản lý Tags</h1>
          <Button onClick={handleNewTag}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Tag
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Slug: {tag.slug}
                </p>
                {tag.description && (
                  <p className="text-sm text-muted-foreground">
                    {tag.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Chưa có tag nào được tạo.
            </p>
            <Button onClick={handleNewTag}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo tag đầu tiên
            </Button>
          </div>
        )}

        {/* Dialog for Create/Edit Tag */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag ? "Chỉnh sửa Tag" : "Tạo Tag mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Tag *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      name,
                      slug: generateSlug(name)
                    }));
                  }}
                  placeholder="React, TypeScript, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="react, typescript, etc."
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả ngắn về tag..."
                />
              </div>

              <div>
                <Label htmlFor="color">Màu sắc</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border border-input"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTag ? "Cập nhật" : "Tạo"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TagManagement;