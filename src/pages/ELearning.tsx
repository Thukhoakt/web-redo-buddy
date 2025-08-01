import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pin, Download, Eye } from "lucide-react";

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

const ELearning = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "general", label: "Chung" },
    { value: "programming", label: "Lập trình" },
    { value: "design", label: "Thiết kế" },
    { value: "business", label: "Kinh doanh" },
    { value: "tutorial", label: "Hướng dẫn" },
    { value: "resource", label: "Tài nguyên" },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (categoryValue: string) => {
    return categories.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            E-learning
          </h1>
          <div className="w-16 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá và tải về các tài liệu học tập, hướng dẫn và tài nguyên hữu ích
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Pinned Documents */}
            {documents.filter(doc => doc.is_pinned).length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <Pin className="h-6 w-6 mr-2 text-primary" />
                  Tài liệu nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {documents
                    .filter(doc => doc.is_pinned)
                    .map((doc) => (
                      <Card key={doc.id} className="group hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 border-primary/20">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center">
                                <Pin className="h-4 w-4 mr-2 text-primary" />
                                {doc.title}
                              </CardTitle>
                              <Badge variant="secondary" className="mt-2">
                                {getCategoryLabel(doc.category)}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {doc.description && (
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
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
                            <Button asChild variant="default" size="sm" className="flex-1">
                              <a href={doc.file_url} download>
                                <Download className="h-4 w-4 mr-2" />
                                Tải xuống
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
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Tất cả tài liệu
              </h2>
              
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="group hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {doc.title}
                              {doc.is_pinned && <Pin className="h-4 w-4 ml-2 inline text-primary" />}
                            </CardTitle>
                            <Badge variant="secondary" className="mt-2">
                              {getCategoryLabel(doc.category)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {doc.description && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
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
                          <Button asChild variant="default" size="sm" className="flex-1">
                            <a href={doc.file_url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Tải xuống
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Chưa có tài liệu nào được chia sẻ.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ELearning;