import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Profile {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  phone: string;
  avatar_url: string;
  date_of_birth: string;
  created_at: string;
}

interface SavedPost {
  id: string;
  created_at: string;
  posts: {
    id: string;
    title: string;
    excerpt: string;
    created_at: string;
    reading_time: number;
  };
}

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    phone: "",
    date_of_birth: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchProfile(user.id);
      await fetchSavedPosts(user.id);
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        username: data.username || "",
        bio: data.bio || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth || "",
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSavedPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          *,
          posts (id, title, excerpt, created_at, reading_time)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedPosts(data || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          username: editForm.username,
          bio: editForm.bio,
          phone: editForm.phone,
          date_of_birth: editForm.date_of_birth || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
      setIsEditing(false);

      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    }
  };

  const handleUnsavePost = async (savedPostId: string) => {
    try {
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('id', savedPostId);

      if (error) throw error;

      setSavedPosts(prev => prev.filter(sp => sp.id !== savedPostId));
      
      toast({
        title: "Đã xóa",
        description: "Bài viết đã được xóa khỏi danh sách lưu",
      });
    } catch (error) {
      console.error('Error unsaving post:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài viết",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Vui lòng đăng nhập
              </h1>
              <Button asChild>
                <a href="/auth">Đăng nhập</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        {/* Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Thông tin cá nhân</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      full_name: profile?.full_name || "",
                      username: profile?.username || "",
                      bio: profile?.bio || "",
                      phone: profile?.phone || "",
                      date_of_birth: profile?.date_of_birth || "",
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Lưu
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    Thay đổi ảnh đại diện
                  </Button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Họ và tên</label>
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({...prev, full_name: e.target.value}))}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tên người dùng</label>
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm(prev => ({...prev, username: e.target.value}))}
                        placeholder="Nhập tên người dùng"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Số điện thoại</label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ngày sinh</label>
                      <Input
                        type="date"
                        value={editForm.date_of_birth}
                        onChange={(e) => setEditForm(prev => ({...prev, date_of_birth: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Giới thiệu</label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({...prev, bio: e.target.value}))}
                        placeholder="Viết vài dòng giới thiệu về bạn..."
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        {profile?.full_name || "Chưa cập nhật"}
                      </h2>
                      <p className="text-muted-foreground">
                        @{profile?.username || "username"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile?.date_of_birth && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(profile.date_of_birth), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          Tham gia {format(new Date(profile?.created_at || user.created_at), 'MM/yyyy', { locale: vi })}
                        </span>
                      </div>
                    </div>

                    {profile?.bio && (
                      <div className="pt-4">
                        <p className="text-foreground">{profile.bio}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Bài viết đã lưu ({savedPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedPosts.length > 0 ? (
              <div className="space-y-4">
                {savedPosts.map((savedPost) => (
                  <div key={savedPost.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-2">
                          <a href={`/blog/${savedPost.posts.id}`} className="hover:text-primary">
                            {savedPost.posts.title}
                          </a>
                        </h3>
                        {savedPost.posts.excerpt && (
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {savedPost.posts.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Lưu ngày {format(new Date(savedPost.created_at), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                          {savedPost.posts.reading_time && (
                            <Badge variant="secondary" className="text-xs">
                              {savedPost.posts.reading_time} phút đọc
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnsavePost(savedPost.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Bạn chưa lưu bài viết nào.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;