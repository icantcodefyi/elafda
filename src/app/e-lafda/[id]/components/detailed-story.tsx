import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatRelativeTime } from "~/lib/utils";

interface DetailedStoryProps {
  detailedStory: string | null;
  lafdaDate: Date;
}

export function DetailedStory({ detailedStory, lafdaDate }: DetailedStoryProps) {
  if (!detailedStory) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">No detailed story available</h3>
        <p className="text-muted-foreground">
          The detailed story for this e-lafda hasn&apos;t been provided yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detailed Story</span>
            <span className="text-sm font-normal text-muted-foreground">
              Incident Date: {formatRelativeTime(lafdaDate)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {detailedStory.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 