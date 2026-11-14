import React, { useEffect, useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<any | null>(null);
  const [selectedCity, setSelectedCity] = useState('Indore');
  const [isLoading, setIsLoading] = useState(true);

  const cityCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
    Indore: { lat: 22.7196, lng: 75.8577, name: 'Indore Agro-Meteorological Zone' },
    Sanwer: { lat: 22.9772, lng: 75.8286, name: 'Sanwer Rural Cluster, MP' },
    Ujjain: { lat: 23.1765, lng: 75.7885, name: 'Ujjain District Farming Belt' },
    Dewas: { lat: 22.9676, lng: 76.0534, name: 'Dewas Kshipra Basin' },
    Dhar: { lat: 22.6000, lng: 75.3000, name: 'Dhar Agricultural Belt' },
    Bhopal: { lat: 23.2599, lng: 77.4126, name: 'Bhopal Agro-Climatic Zone' },
  };

  const fetchWeather = (cityKey: string) => {
    setIsLoading(true);
    const coords = cityCoordinates[cityKey] || cityCoordinates['Indore'];

    api
      .get(`/weather?lat=${coords.lat}&lng=${coords.lng}&location=${encodeURIComponent(coords.name)}`)
      .then((res) => setWeather(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Agro-Meteorological Forecast</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time climatic feeds, precipitation probability, and farm spraying advisories
          </p>
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-agri-dark" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
          >
            {Object.keys(cityCoordinates).map((c) => (
              <option key={c} value={c}>
                {c} Region
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Fetching live satellite weather telemetry...</p>
        </div>
      ) : weather ? (
        <div className="space-y-6">
          {/* Main Weather Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-agri-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-agri-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" /> {weather.location}
                </span>
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight">{weather.temperature}°C</span>
                  <span className="text-lg font-bold text-agri-100">{weather.condition}</span>
                </div>
                <p className="text-xs text-agri-200 pt-1">
                  Source: <strong>{weather.source}</strong>
                </p>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <Droplets className="w-5 h-5 mx-auto text-sky-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-agri-200">Humidity</span>
                  <p className="text-base font-extrabold">{weather.humidity}%</p>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <CloudRain className="w-5 h-5 mx-auto text-amber-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-agri-200">Rain Risk</span>
                  <p className="text-base font-extrabold">{weather.rainProb}%</p>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                  <Wind className="w-5 h-5 mx-auto text-emerald-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-agri-200">Wind</span>
                  <p className="text-base font-extrabold">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agro-Advisories based on weather */}
          <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 space-y-2">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Agrometeorological Directives & Alerts</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
              {weather.alerts?.map((alert: string, idx: number) => (
                <li key={idx} className="font-medium leading-relaxed">
                  {alert}
                </li>
              ))}
            </ul>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-3xl border border-warm-border p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>7-Day Agricultural Field Forecast</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast?.map((day: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition text-center space-y-2"
                >
                  <p className="text-xs font-extrabold text-slate-800">{day.dayName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{day.date.slice(5)}</p>
                  <div className="py-1">
                    <CloudSun className="w-6 h-6 mx-auto text-amber-500" />
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {day.maxTemp}° / <span className="text-slate-400 font-normal">{day.minTemp}°</span>
                  </div>
                  <p className="text-[10px] text-sky-600 font-bold">Rain: {day.rainProb}%</p>
                  <div className="pt-1 border-t border-slate-200/60">
                    <span
                      className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        day.rainProb > 40
                          ? 'bg-rose-100 text-rose-800'
                          : day.rainProb > 20
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {day.sprayCondition || 'Optimal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
