
'use client';

import { format, isSameDay, addDays, startOfToday, isToday, isTomorrow } from 'date-fns';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import type { DayContext } from '@/lib/types';
import { WeatherIcon } from './weather-icon';

interface DaySelectorProps {
  dailyData: DayContext[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function DaySelector({ dailyData, selectedDate, onDateSelect }: DaySelectorProps) {
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));
  
  const getDayLabel = (day: Date): string => {
    if (isToday(day)) return "Today";
    if (isTomorrow(day)) return "2moro";
    return format(day, 'EEE');
  }

  return (
    <div className="w-full">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {days.map((day, index) => {
            const dayData = dailyData[index];
            const isSelected = isSameDay(day, selectedDate);
            
            return (
                <Card
                key={day.toString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                    "flex-shrink-0 p-1 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all aspect-[10/12]",
                    "border shadow-sm",
                    isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-secondary"
                )}
                >
                <p className="font-semibold text-[11px] sm:text-xs">{getDayLabel(day)}</p>
                <p className="text-base sm:text-lg font-bold mt-0.5">{format(day, 'd')}</p>
                {dayData && (
                    <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                        <WeatherIcon condition="clear" className="w-3 h-3" />
                        <span className="text-[11px]">{Math.round(dayData.uvMax)}</span>
                    </div>
                )}
                </Card>
            );
            })}
        </div>
    </div>
  );
}
