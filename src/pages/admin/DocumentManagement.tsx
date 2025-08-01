import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, Pin, PinOff, Upload, Download, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  is_pinned: boolean;
  category: string;
  created_at: string;
}

const DocumentManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    is_pinned: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const categories = [
    { value: "general", label: "Chung" },
    { value: "programming", label: "Lập trình" },
    { value: "design", label: "Thiết kế" },
    { value: "business", label: "Kinh doanh" },
    { value: "tutorial", label: "Hướng dẫn" },
    { value: "resource", label: "Tài nguyên" },
  ];

  useEffect(() => {
    checkUserRole();
    fetchDocuments();
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
        description: "Bạn cần quyền admin để quản lý tài liệu.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Lỗi tải tài liệu",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `documents/${Date.now()}-${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('blog-images') // Using existing bucket for now
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingFile(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let fileUrl = editingDoc?.file_url || "";
      let fileType = editingDoc?.file_type || "";

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile) || "";
        fileType = selectedFile.type || selectedFile.name.split('.').pop() || "";
      }

      if (!fileUrl && !editingDoc) {
        throw new Error("Vui lòng chọn file để upload");
      }

      if (editingDoc) {
        const { error } = await supabase
          .from('documents')
          .update({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            is_pinned: formData.is_pinned,
            file_url: fileUrl,
            file_type: fileType,
          })
          .eq('id', editingDoc.id);

        if (error) throw error;
        
        toast({
          title: "Cập nhật thành công",
          description: "Tài liệu đã được cập nhật.",
        });
      } else {
        const { error } = await supabase
          .from('documents')
          .insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            is_pinned: formData.is_pinned,
            file_url: fileUrl,
            file_type: fileType,
            created_by: user.id,
          });

        if (error) throw error;
        
        toast({
          title: "Tạo thành công",
          description: "Tài liệu mới đã được tạo.",
        });
      }

      setIsDialogOpen(false);
      setEditingDoc(null);
      setSelectedFile(null);
      setFormData({ title: "", description: "", category: "general", is_pinned: false });
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description || "",
      category: doc.category,
      is_pinned: doc.is_pinned,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      
      toast({
        title: "Xóa thành công",
        description: "Tài liệu đã được xóa.",
      });
      
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Lỗi xóa tài liệu",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePin = async (docId: string, currentPinStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_pinned: !currentPinStatus })
        .eq('id', docId);

      if (error) throw error;
      
      toast({
        title: currentPinStatus ? "Bỏ ghim thành công" : "Ghim thành công",
        description: currentPinStatus ? "Tài liệu đã được bỏ ghim." : "Tài liệu đã được ghim.",
      });
      
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNewDocument = () => {
    setEditingDoc(null);
    setFormData({ title: "", description: "", category: "general", is_pinned: false });
    setSelectedFile(null);
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
          <h1 className="text-3xl font-bold text-foreground">Quản lý Tài liệu E-learning</h1>
          <Button onClick={handleNewDocument}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Tài liệu
          </Button>
        </div>

        {/* Pinned Documents */}
        {documents.filter(doc => doc.is_pinned).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Pin className="h-5 w-5 mr-2 text-primary" />
              Tài liệu được ghim
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents
                .filter(doc => doc.is_pinned)
                .map((doc) => (
                  <Card key={doc.id} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <Pin className="h-4 w-4 mr-2 text-primary" />
                          {doc.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => togglePin(doc.id, doc.is_pinned)}
                          >
                            <PinOff className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Danh mục: {categories.find(c => c.value === doc.category)?.label}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <a href={doc.file_url} download>
                            <Download className="h-4 w-4 mr-2" />
                            Tải
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* All Documents */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tất cả tài liệu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => togglePin(doc.id, doc.is_pinned)}
                      >
                        {doc.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Danh mục: {categories.find(c => c.value === doc.category)?.label}
                  </p>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {doc.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={doc.file_url} download>
                        <Download className="h-4 w-4 mr-2" />
                        Tải
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Chưa có tài liệu nào được tạo.
            </p>
            <Button onClick={handleNewDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo tài liệu đầu tiên
            </Button>
          </div>
        )}

        {/* Dialog for Create/Edit Document */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingDoc ? "Chỉnh sửa Tài liệu" : "Thêm Tài liệu mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tiêu đề tài liệu..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả ngắn về tài liệu..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Danh mục</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">File tài liệu {!editingDoc && "*"}</Label>
                <div className="mt-2">
                  <input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.avi,.mov"
                  />
                  {editingDoc && !selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Để trống nếu không muốn thay đổi file hiện tại
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_pinned: checked }))}
                />
                <Label htmlFor="pinned">Ghim tài liệu</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={uploadingFile} className="flex-1">
                  {uploadingFile ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingDoc ? "Cập nhật" : "Tạo"}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={uploadingFile}
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

export default DocumentManagement;