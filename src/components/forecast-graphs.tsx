'use client'

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MOCK_FORECAST_GRAPHS } from "@/lib/types"

const hourlyChartConfig = {
  success: {
    label: "Success %",
    color: "hsl(var(--primary))",
  },
}

const dailyChartConfig = {
  success: {
    label: "Success",
    color: "hsl(var(--primary))",
  },
  uv: {
    label: "UV Index",
    color: "hsl(var(--chart-2))",
  },
}

interface ForecastGraphsProps {
    hourlyData?: { time: string; success: number }[];
}

export function ForecastGraphs({ hourlyData = MOCK_FORECAST_GRAPHS.hourly }: ForecastGraphsProps) {
  
  return (
    <Card className="bg-panel text-primary-foreground rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline text-h2 text-white">Fishing Forecast</CardTitle>
        <CardDescription className="text-muted-foreground">Hourly and daily outlook for your spot.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly">
          <TabsList className="grid w-full grid-cols-2 bg-foreground/10">
            <TabsTrigger value="hourly">Next 24 Hours</TabsTrigger>
            <TabsTrigger value="daily">Next 7 Days</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly" className="pt-6">
            <ChartContainer config={hourlyChartConfig} className="h-64 w-full">
              <AreaChart accessibilityLayer data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.replace(/ /g, '')} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                   stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '3 3' }} 
                  content={<ChartTooltipContent 
                    indicator="dot" 
                    labelClassName="text-card-foreground font-semibold"
                    className="bg-card text-card-foreground rounded-lg shadow-card"
                    formatter={(value, name) => (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-bold text-card-foreground">{`${value}%`}</span>
                      </div>
                    )}
                    />} 
                />
                <Area
                  dataKey="success"
                  type="monotone"
                  fill="url(#fillSuccess)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="daily" className="pt-6">
            <ChartContainer config={dailyChartConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={MOCK_FORECAST_GRAPHS.daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)"/>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis yAxisId="left" orientation="left" stroke="var(--color-success)" hide />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-uv)" hide/>
                <Tooltip 
                  content={<ChartTooltipContent 
                  className="bg-card text-card-foreground rounded-lg shadow-card"
                  labelClassName="font-semibold"
                  />} 
                />
                <Bar dataKey="success" yAxisId="left" fill="hsl(var(--primary))" radius={8} />
                <Bar dataKey="uv" yAxisId="right" fill="hsl(var(--chart-2))" radius={8} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
