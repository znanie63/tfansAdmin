import { Line, LineChart, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCompletionStats } from "@/lib/stats";

interface TaskChartProps {
  data: TaskCompletionStats[];
}

export function TaskChart({ data }: TaskChartProps) {
  // Transform data for the chart
  const chartData = data[0]?.data.map((point, index) => ({
    date: point.date,
    ...data.reduce((acc, series) => {
      acc[series.taskName] = series.data[index]?.count || 0;
      return acc;
    }, {} as Record<string, number>)
  })) || [];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            {data.map((series, index) => (
              <linearGradient
                key={series.taskName}
                id={`gradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={`hsl(var(--chart-${(index % 5) + 1}))`}
                  stopOpacity={0.5}
                />
                <stop
                  offset="100%"
                  stopColor={`hsl(var(--chart-${(index % 5) + 1}))`}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted" 
            horizontal={true}
            vertical={false}
          />
          <XAxis 
            scale="auto"
            padding={{ left: 10, right: 10 }}
            dataKey="date"
            className="text-xs fill-muted-foreground"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            className="text-xs fill-muted-foreground"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(label).toLocaleDateString()}
                  </div>
                  <div className="grid gap-1">
                    {payload.map((item: any, index: number) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div 
                          className="h-2 w-2 rounded-full"
                          style={{ 
                            backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` 
                          }}
                        />
                        <span className="text-xs font-medium">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          {data.map((series, index) => (
            <Area
              key={series.taskName}
              type="monotone"
              dataKey={series.taskName}
              stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
              fill={`url(#gradient-${index})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}