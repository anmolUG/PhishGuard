import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../common/Card";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-secondary rounded-md">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <p className={cn(
            "text-xs mt-1",
            trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
          )}>
            {subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
