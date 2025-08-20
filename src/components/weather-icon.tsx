import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun } from "lucide-react";

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export function WeatherIcon({ condition, className }: WeatherIconProps) {
  const lowerCaseCondition = condition.toLowerCase();

  if (lowerCaseCondition.includes('sunny') || lowerCaseCondition.includes('clear')) {
    return <Sun className={className} />;
  }
  if (lowerCaseCondition.includes('partly cloudy')) {
    return <CloudSun className={className} />;
  }
  if (lowerCaseCondition.includes('cloudy')) {
    return <Cloud className={className} />;
  }
  if (lowerCaseCondition.includes('rain') || lowerCaseCondition.includes('showers')) {
    return <CloudRain className={className} />;
  }
  if (lowerCaseCondition.includes('snow')) {
    return <CloudSnow className={className} />;
  }
  if (lowerCaseCondition.includes('thunder') || lowerCaseCondition.includes('storm')) {
    return <CloudLightning className={className} />;
  }

  // Default icon
  return <Cloud className={className} />;
}
