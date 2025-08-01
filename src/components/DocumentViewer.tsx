import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  document: {
    id: string;
    title: string;
    html_content?: string;
    file_url?: string;
  };
}

export const DocumentViewer = ({ document }: DocumentViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleView = () => {
    if (document.html_content) {
      setIsOpen(true);
    } else {
      // Fallback to file URL if no HTML content
      window.open(document.file_url, '_blank');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Xem
      </Button>

      {document.html_content && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-6xl h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="flex items-center justify-between">
                {document.title}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`data:text/html,${encodeURIComponent(document.html_content!)}`, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mở toàn màn hình
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-6 pt-0">
              <iframe
                srcDoc={document.html_content}
                className="w-full h-full border rounded-lg"
                title={document.title}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};