import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../common/Card";

interface RiskDistributionProps {
  safe: number;
  suspicious: number;
  high: number;
}

export function RiskDistribution({ safe, suspicious, high }: RiskDistributionProps) {
  const data = [
    { name: "Safe", value: safe, color: "hsl(160, 84%, 39%)" },
    { name: "Suspicious", value: suspicious, color: "hsl(38, 92%, 50%)" },
    { name: "High Risk", value: high, color: "hsl(0, 84%, 60%)" },
  ];
  const total = safe + suspicious + high;
  const chartData = total === 0 ? [{ name: "No data", value: 1, color: "hsl(240, 4%, 16%)" }] : data;

  return (
    <Card className="col-span-4 lg:col-span-1">
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              {total > 0 && (
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(240, 10%, 6%)", borderColor: "hsl(240, 4%, 16%)", borderRadius: 8 }}
                  itemStyle={{ color: "hsl(0, 0%, 98%)" }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">{total}</span>
            <span className="text-xs text-muted-foreground">Total Scans</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          {data.map((item) => (
            <div key={item.name} className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground text-xs">{item.name}</span>
              </div>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
