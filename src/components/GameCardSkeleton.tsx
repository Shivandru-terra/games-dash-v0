import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function GameCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle>
          <Skeleton className="h-6 w-32" /> {/* title placeholder */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" /> {/* line 1 */}
        <Skeleton className="h-4 w-3/4" />       {/* line 2 */}
      </CardContent>
    </Card>
  );
}
