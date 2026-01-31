import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin } from 'lucide-react';
import { useApp, useTranslation } from '@/contexts/AppContext';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  location: string;
  forecast: { day: string; temp: number; condition: string }[];
}

const conditionIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-12 h-12 text-accent" />,
  cloudy: <Cloud className="w-12 h-12 text-muted-foreground" />,
  rainy: <CloudRain className="w-12 h-12 text-primary" />,
  'partly-cloudy': <Cloud className="w-12 h-12 text-muted-foreground" />,
};

export function WeatherWidget() {
  const { userLocation, requestLocation } = useApp();
  const t = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request location on mount
    requestLocation();
  }, []);

  useEffect(() => {
    // Simulate weather data based on location
    if (userLocation) {
      setLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setWeather({
          temperature: Math.round(25 + Math.random() * 10),
          humidity: Math.round(60 + Math.random() * 30),
          windSpeed: Math.round(5 + Math.random() * 15),
          condition: ['sunny', 'cloudy', 'partly-cloudy'][Math.floor(Math.random() * 3)] as WeatherData['condition'],
          location: 'Your Location',
          forecast: [
            { day: 'Mon', temp: 28, condition: 'sunny' },
            { day: 'Tue', temp: 26, condition: 'partly-cloudy' },
            { day: 'Wed', temp: 24, condition: 'rainy' },
            { day: 'Thu', temp: 27, condition: 'sunny' },
            { day: 'Fri', temp: 29, condition: 'sunny' },
          ],
        });
        setLoading(false);
      }, 1000);
    } else {
      // Default weather when no location
      setWeather({
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: 'sunny',
        location: 'Enable Location',
        forecast: [
          { day: 'Mon', temp: 28, condition: 'sunny' },
          { day: 'Tue', temp: 26, condition: 'partly-cloudy' },
          { day: 'Wed', temp: 24, condition: 'rainy' },
          { day: 'Thu', temp: 27, condition: 'sunny' },
          { day: 'Fri', temp: 29, condition: 'sunny' },
        ],
      });
      setLoading(false);
    }
  }, [userLocation]);

  if (loading) {
    return (
      <div className="card-premium p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-24 mb-4" />
        <div className="h-16 bg-muted rounded w-32 mb-4" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {conditionIcons[weather.condition]}
          {t('weather')}
        </h3>
        <button
          onClick={requestLocation}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MapPin className="w-4 h-4" />
          {weather.location}
        </button>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-5xl font-bold text-foreground">
            {weather.temperature}°C
          </div>
          <p className="text-muted-foreground capitalize mt-1">
            {weather.condition.replace('-', ' ')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="w-4 h-4 text-accent" />
            <span>{weather.humidity}% Humidity</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wind className="w-4 h-4 text-primary" />
            <span>{weather.windSpeed} km/h Wind</span>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">5-Day Forecast</h4>
        <div className="flex justify-between">
          {weather.forecast.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
              <div className="w-8 h-8 mx-auto mb-1">
                {day.condition === 'sunny' && <Sun className="w-full h-full text-accent" />}
                {day.condition === 'partly-cloudy' && <Cloud className="w-full h-full text-muted-foreground" />}
                {day.condition === 'rainy' && <CloudRain className="w-full h-full text-primary" />}
              </div>
              <p className="text-sm font-medium text-foreground">{day.temp}°</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
