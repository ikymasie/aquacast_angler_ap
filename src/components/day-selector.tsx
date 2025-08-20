
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
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="flex space-x-2">
        {days.map((day, index) => {
          const dayData = dailyData[index];
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <Card
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex-shrink-0 w-14 h-[72px] p-1 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all",
                "border shadow-sm",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-secondary"
              )}
            >
              <p className="font-semibold text-[11px]">{getDayLabel(day)}</p>
              <p className="text-base font-bold mt-0.5">{format(day, 'd')}</p>
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
      <style jsx>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-x-auto {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}
