import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailSubscriptionModal = ({ isOpen, onClose }: EmailSubscriptionModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .insert({
          email: formData.email,
          name: formData.name,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Email đã được đăng ký",
            description: "Email này đã có trong danh sách đăng ký của chúng tôi.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Đăng ký thành công!",
          description: "Cảm ơn bạn đã đăng ký. Chúng tôi sẽ gửi cho bạn những thông tin mới nhất.",
        });
        setFormData({ email: "", name: "" });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Lỗi đăng ký",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background/95 backdrop-blur">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-hero flex items-center justify-center overflow-hidden">
              <div className="text-white font-bold text-lg">JD</div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Bạn muốn John tâm sự qua email này?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-2">
            Email là nơi John tâm sự chuyện cá nhân đời sống, 
            chia sẻ các mẹo học tập & làm việc, chia sẻ các 
            thông tin hay mà John học được, và cập nhật các dự 
            án/video/ Podcast mới của John
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email (Gmail)
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="example@gmail.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Họ & tên
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập họ và tên của bạn"
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-base"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSubscriptionModal;