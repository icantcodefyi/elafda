import Image from "next/image";
import { ExternalLink, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface ScreenshotGalleryProps {
  screenshots: string[];
  sourceLinks: string[];
}

export function ScreenshotGallery({ screenshots, sourceLinks }: ScreenshotGalleryProps) {
  if (screenshots.length === 0 && sourceLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Screenshots</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {screenshots.map((screenshot, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Image
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full rounded-lg object-cover"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Screenshot {index + 1}
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Source Links */}
      {sourceLinks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Source Links</h3>
          <div className="space-y-2">
            {sourceLinks.map((link, index) => {
              const url = new URL(link);
              const domain = url.hostname.replace('www.', '');
              
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">
                          Source {index + 1}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {domain}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Open
                        </a>
                      </Button>
                    </div>
                    <CardDescription className="text-xs break-all">
                      {link}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 