import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, LogOut, Settings, FileText, Users, ChevronDown, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmailSubscriptionModal from "@/components/EmailSubscriptionModal";

interface HeaderProps {
  user: any;
  isAdmin: boolean;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const Header = ({ user, isAdmin }: HeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags();
  }, []);

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

  const navigation = [
    { name: "HOME", href: "/", current: location.pathname === "/" },
    { name: "YOUTUBE", href: "#", current: false },
    { name: "TÀI LIỆU", href: "/elearning", current: location.pathname === "/elearning" },
    { name: "E-learning", href: "/elearning", current: location.pathname === "/elearning" },
  ];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Lỗi đăng xuất",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi tài khoản.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            John Deus
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  item.current
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Email Link */}
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Email
            </button>
            
            {/* Blog Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                BLOG
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur">
                <DropdownMenuItem asChild>
                  <Link to="/blog" className="flex items-center">
                    Tất cả bài viết
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {tags.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Danh mục
                    </div>
                    {tags.map((tag) => (
                      <DropdownMenuItem key={tag.id} asChild>
                        <Link to={`/blog?tag=${tag.slug}`} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      setIsEmailModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left"
                  >
                    Email
                  </button>
                  
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-foreground mb-3">Blog</h3>
                    <Link
                      to="/blog"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-muted-foreground hover:text-primary transition-colors mb-2"
                    >
                      Tất cả bài viết
                    </Link>
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/blog?tag=${tag.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center text-muted-foreground hover:text-primary transition-colors mb-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                  
                  {user && (
                    <div className="border-t pt-4">
                      {isAdmin && (
                        <>
                          <Link
                            to="/create-post"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-muted-foreground hover:text-primary transition-colors mb-2"
                          >
                            Tạo bài viết
                          </Link>
                          <Link
                            to="/admin/tags"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-muted-foreground hover:text-primary transition-colors mb-2"
                          >
                            Quản lý Tags
                          </Link>
                          <Link
                            to="/admin/documents"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-muted-foreground hover:text-primary transition-colors mb-2"
                          >
                            Quản lý Tài liệu
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                  
                  {!user && (
                    <div className="border-t pt-4">
                      <Link
                        to="/auth"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        Đăng nhập
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/blog')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Create Post Button (Admin only) */}
                {isAdmin && (
                  <Button asChild variant="default">
                    <Link to="/create-post">
                      <FileText className="h-4 w-4 mr-2" />
                      Tạo bài
                    </Link>
                  </Button>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt="Avatar" />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.email}</p>
                        {isAdmin && (
                          <p className="text-xs text-muted-foreground">Admin</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        User
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/tags">
                            <Settings className="mr-2 h-4 w-4" />
                            Quản lý Tags
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/documents">
                            <FileText className="mr-2 h-4 w-4" />
                            Quản lý Tài liệu
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">
                          <Users className="mr-2 h-4 w-4" />
                          Quản lý người dùng
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild>
                <Link to="/auth">Đăng nhập</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Email Subscription Modal */}
      <EmailSubscriptionModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
      />
    </header>
  );
};

export default Header;