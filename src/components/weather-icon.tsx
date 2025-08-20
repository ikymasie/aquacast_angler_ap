import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudSun, MoveUp } from "lucide-react";

interface WeatherIconProps {
  condition: string;
  className?: string;
  windDeg?: number;
}

export function WeatherIcon({ condition, className, windDeg }: WeatherIconProps) {
  const lowerCaseCondition = condition.toLowerCase();

  if (lowerCaseCondition === 'wind') {
    const style = windDeg !== undefined ? { transform: `rotate(${windDeg}deg)` } : {};
    return <MoveUp className={className} style={style} />;
  }
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

    