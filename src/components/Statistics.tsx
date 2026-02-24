'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Eye, 
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  subDays, 
  subMonths, 
  subYears, 
  isAfter, 
  startOfDay, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  eachMonthOfInterval,
  isSameMonth
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsData {
  ownerEmail: string;
  type: 'view' | 'keywords' | 'download_pdf';
  viewerId: string;
  timestamp: string;
  keyword?: string;
}

interface StatisticsProps {
  userEmail: string;
}

type Period = 'Jour' | 'Semaine' | 'Mois' | 'Année';

export default function Statistics({ userEmail }: StatisticsProps) {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('Semaine');
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (userEmail === lastFetchedEmailRef.current) return;
      
      setIsLoading(true);
      setError(null);
      lastFetchedEmailRef.current = userEmail;
      
      try {
        const token = await user?.getIdToken();
        
        const response = await fetch("/api/n8n-proxy", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ 
            action: "get-analytics",
            email: userEmail 
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');

        const result = await response.json();
        
        // Gestion du cas aux limites : si un seul élément est renvoyé comme objet simple
        let rawData: AnalyticsData[] = [];
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          rawData = [result];
        } else {
          rawData = Array.isArray(result) ? result : [];
        }

        // Filtrer les objets vides ou invalides (ex: [{}])
        const validData = rawData.filter(item => item && item.timestamp && item.type);
        setData(validData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Impossible de charger les statistiques.');
      } finally {
        setIsLoading(false);
      }
    };

    if (userEmail) {
      fetchAnalytics();
    }
  }, [userEmail]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'Jour': startDate = startOfDay(now); break;
      case 'Semaine': startDate = startOfDay(subDays(now, 6)); break;
      case 'Mois': startDate = startOfDay(subMonths(now, 1)); break;
      case 'Année': startDate = startOfDay(subYears(now, 1)); break;
      default: startDate = startOfDay(subDays(now, 6));
    }

    return data.filter(item => isAfter(parseISO(item.timestamp), startDate) || isSameDay(parseISO(item.timestamp), startDate));
  }, [data, period]);

  const chartData = useMemo(() => {
    const now = new Date();
    let interval: Date[];
    let dateFormat: string;

    if (period === 'Année') {
      interval = eachMonthOfInterval({
        start: subYears(now, 1),
        end: now
      });
      dateFormat = 'MMM';
    } else {
      let days = 7;
      if (period === 'Jour') days = 1;
      if (period === 'Mois') days = 30;
      
      interval = eachDayOfInterval({
        start: period === 'Jour' ? startOfDay(now) : subDays(now, days - 1),
        end: now
      });
      dateFormat = period === 'Jour' ? 'HH:mm' : 'dd MMM';
    }

    return interval.map(date => {
      const views = data.filter(item => 
        item.type === 'view' && 
        (period === 'Année' ? isSameMonth(parseISO(item.timestamp), date) : isSameDay(parseISO(item.timestamp), date))
      ).length;

      const searches = data.filter(item => 
        item.type === 'keywords' && 
        (period === 'Année' ? isSameMonth(parseISO(item.timestamp), date) : isSameDay(parseISO(item.timestamp), date))
      ).length;

      const downloads = data.filter(item => 
        item.type === 'download_pdf' && 
        item.viewerId !== userEmail &&
        (period === 'Année' ? isSameMonth(parseISO(item.timestamp), date) : isSameDay(parseISO(item.timestamp), date))
      ).length;

      return {
        name: format(date, dateFormat, { locale: fr }),
        views,
        searches,
        downloads,
      };
    });
  }, [data, period, userEmail]);

  const stats = useMemo(() => {
    const views = filteredData.filter(item => item.type === 'view').length;
    const searches = filteredData.filter(item => item.type === 'keywords').length;
    const downloads = filteredData.filter(item => 
      item.type === 'download_pdf' && 
      item.viewerId !== userEmail
    ).length;
    
    // Calcul de l'évolution (simplifié pour l'instant)
    const evolution = views > 0 ? 100 : 0;

    const keywords = filteredData
      .filter(item => item.type === 'keywords' && item.keyword && String(item.keyword).toLowerCase() !== 'undefined')
      .reduce((acc: Record<string, number>, item) => {
        const k = String(item.keyword).trim().toLowerCase();
        if (k) {
          acc[k] = (acc[k] || 0) + 1;
        }
        return acc;
      }, {});

    const topKeywords = Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return { views, searches, downloads, evolution, topKeywords };
  }, [filteredData, userEmail]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Analyse de vos données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-900 mb-2">Erreur</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['Jour', 'Semaine', 'Mois', 'Année'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                period === p 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${stats.evolution >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.evolution >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(stats.evolution)}%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Vues</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.views}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">En direct</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Apparitions Recherche</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.searches}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">PDF</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Téléchargements CV</p>
          <h3 className="text-3xl font-bold text-slate-900">{stats.downloads}</h3>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Évolution de la visibilité</h3>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: '600' }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                name="Vues"
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="searches" 
                name="Recherches"
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSearches)" 
              />
              <Area 
                type="monotone" 
                dataKey="downloads" 
                name="Téléchargements"
                stroke="#f59e0b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDownloads)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Mots-clés qui boostent votre visibilité</h3>
        <div className="flex flex-wrap gap-2">
          {stats.topKeywords.length > 0 ? (
            stats.topKeywords.map((keyword, i) => (
              <span 
                key={i}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold border border-indigo-100"
              >
                {keyword}
              </span>
            ))
          ) : (
            <p className="text-slate-400 text-sm italic">Pas encore assez de données pour identifier vos mots-clés phares.</p>
          )}
        </div>
      </div>
    </div>
  );
}
