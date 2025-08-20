'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
    color: "hsl(var(--accent))",
  },
}

export function ForecastGraphs() {
  const data = MOCK_FORECAST_GRAPHS;
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Fishing Forecast</CardTitle>
        <CardDescription>Hourly and daily outlook for your spot.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hourly">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly">Next 24 Hours</TabsTrigger>
            <TabsTrigger value="daily">Next 7 Days</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly">
            <ChartContainer config={hourlyChartConfig} className="h-64 w-full">
              <LineChart accessibilityLayer data={data.hourly} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                <Line
                  dataKey="success"
                  type="monotone"
                  stroke="var(--color-success)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="daily">
            <ChartContainer config={dailyChartConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={data.daily} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis yAxisId="left" orientation="left" stroke="var(--color-success)" hide />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-uv)" hide/>
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="success" yAxisId="left" fill="var(--color-success)" radius={4} />
                <Bar dataKey="uv" yAxisId="right" fill="var(--color-uv)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
