
'use client'

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

interface TrendsChartProps {
    trends: {
        accuracyPct: { day: string; value: number }[];
        inBandPct: { day: string; value: number }[];
        laneTimePct: { day: string; value: number }[];
    }
}

export function TrendsChart({ trends }: TrendsChartProps) {
  
  return (
    <Card className="bg-panel text-primary-foreground rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-h3 text-white">7-Day Skill Trends</CardTitle>
        <CardDescription className="text-muted-foreground">Your progress on key skills over the last week.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="accuracy">
          <TabsList className="grid w-full grid-cols-3 bg-foreground/10">
            <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
            <TabsTrigger value="cadence">Cadence</TabsTrigger>
            <TabsTrigger value="lane_time">Lane Time</TabsTrigger>
          </TabsList>
          
          <ChartTabContent 
            data={trends.accuracyPct}
            value="accuracy"
            unit="%"
          />
          <ChartTabContent 
            data={trends.inBandPct}
            value="cadence"
            unit="%"
          />
          <ChartTabContent 
            data={trends.laneTimePct}
            value="lane_time"
            unit="%"
          />

        </Tabs>
      </CardContent>
    </Card>
  )
}

function ChartTabContent({ data, value, unit }: { data: any[]; value: string, unit: string }) {
    return (
        <TabsContent value={value} className="pt-6">
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <AreaChart accessibilityLayer data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}${unit}`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }} 
                  content={<ChartTooltipContent 
                    indicator="dot" 
                    labelClassName="text-card-foreground font-semibold"
                    className="bg-card text-card-foreground rounded-lg shadow-card"
                    formatter={(val) => (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-muted-foreground capitalize">{value.replace('_', ' ')}</span>
                        <span className="font-bold text-card-foreground">{`${val}${unit}`}</span>
                      </div>
                    )}
                    />} 
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#fillValue)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
    )
}
