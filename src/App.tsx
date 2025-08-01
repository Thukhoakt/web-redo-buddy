import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import ELearning from "./pages/ELearning";
import UserManagement from "./pages/admin/UserManagement";
import TagManagement from "./pages/admin/TagManagement";
import DocumentManagement from "./pages/admin/DocumentManagement";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<PostDetail />} />
            <Route path="/elearning" element={<ELearning />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/tags" element={<TagManagement />} />
            <Route path="/admin/documents" element={<DocumentManagement />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
