import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../common/Card";

interface DetectionChartProps {
  data: { name: string; detections: number }[];
  days: number;
}

export function DetectionChart({ data, days }: DetectionChartProps) {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Detection Activity</CardTitle>
        <CardDescription>Suspicious and high-risk detections over the last {days} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="hsl(240, 5%, 65%)" fontSize={12} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis stroke="hsl(240, 5%, 65%)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(240, 10%, 6%)", borderColor: "hsl(240, 4%, 16%)", borderRadius: 8 }}
                itemStyle={{ color: "hsl(0, 0%, 98%)" }}
              />
              <Area type="monotone" dataKey="detections" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorDetections)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
