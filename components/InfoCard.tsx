import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  progress: number;
  subtext?: string;
}

export function InfoCard({
  title,
  value,
  icon,
  progress,
  subtext,
}: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <Progress value={progress} className="mt-2" />
        {subtext && (
          <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
