import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface NetworkCardProps<T> {
  title: string;
  data: T[];
  renderItem: (item: T) => ReactNode;
}

export function NetworkCard<T>({
  title,
  data,
  renderItem,
}: NetworkCardProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] overflow-auto">
        <div key={"eth"} className="mb-4">
          {renderItem(data[1]) || "No data"}
        </div>
      </CardContent>
    </Card>
  );
}
