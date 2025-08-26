import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/layout/Header';
import { AddSiteModal } from '../components/monitoring/AddSiteModal';
import { 
  MonitoredSite, 
  SiteMonitoringDashboard, 
  SystemStatusData, 
  Session,
  COUNTRY_NAMES 
} from '../types';
import { supabase } from '../lib/supabaseClient';

interface SiteMonitoringPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  setIsSidebarOpen: (open: boolean) => void;
  openSettings: () => void;
  systemStatus: SystemStatusData;
  session: Session;
}

// Country coordinates for map visualization
const COUNTRY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'US': { lat: 39.8283, lng: -98.5795 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'GB': { lat: 55.3781, lng: -3.4360 },
  'DE': { lat: 51.1657, lng: 10.4515 },
  'FR': { lat: 46.2276, lng: 2.2137 },
  'JP': { lat: 36.2048, lng: 138.2529 },
  'AU': { lat: -25.2744, lng: 133.7751 },
  'BR': { lat: -14.2350, lng: -51.9253 },
  'IN': { lat: 20.5937, lng: 78.9629 },
  'CN': { lat: 35.8617, lng: 104.1954 },
  'RU': { lat: 61.5240, lng: 105.3188 },
  'MX': { lat: 23.6345, lng: -102.5528 },
  'IT': { lat: 41.8719, lng: 12.5674 },
  'ES': { lat: 40.4637, lng: -3.7492 },
  'NL': { lat: 52.1326, lng: 5.2913 },
  'SE': { lat: 60.1282, lng: 18.6435 },
  'NO': { lat: 60.4720, lng: 8.4689 },
  'DK': { lat: 56.2639, lng: 9.5018 },
  'FI': { lat: 61.9241, lng: 25.7482 },
  'CH': { lat: 46.8182, lng: 8.2275 },
  'AT': { lat: 47.5162, lng: 14.5501 },
  'BE': { lat: 50.5039, lng: 4.4699 },
  'PT': { lat: 39.3999, lng: -8.2245 },
  'PL': { lat: 51.9194, lng: 19.1451 },
  'CZ': { lat: 49.8175, lng: 15.4730 },
  'HU': { lat: 47.1625, lng: 19.5033 },
  'GR': { lat: 39.0742, lng: 21.8243 },
  'TR': { lat: 38.9637, lng: 35.2433 },
  'IE': { lat: 53.4129, lng: -8.2439 },
  'NZ': { lat: -40.9006, lng: 174.8860 },
  'SG': { lat: 1.3521, lng: 103.8198 },
  'HK': { lat: 22.3193, lng: 114.1694 },
  'KR': { lat: 35.9078, lng: 127.7669 },
  'TH': { lat: 15.8700, lng: 100.9925 },
  'MY': { lat: 4.2105, lng: 101.9758 },
  'ID': { lat: -0.7893, lng: 113.9213 },
  'PH': { lat: 12.8797, lng: 121.7740 },
  'VN': { lat: 14.0583, lng: 108.2772 },
  'ZA': { lat: -30.5595, lng: 22.9375 },
  'EG': { lat: 26.8206, lng: 30.8025 },
  'NG': { lat: 9.0820, lng: 8.6753 },
  'KE': { lat: -0.0236, lng: 37.9062 },
  'AR': { lat: -38.4161, lng: -63.6167 },
  'CL': { lat: -35.6751, lng: -71.5430 },
  'CO': { lat: 4.5709, lng: -74.2973 },
  'PE': { lat: -9.1900, lng: -75.0152 },
  'VE': { lat: 6.4238, lng: -66.5897 },
  'UY': { lat: -32.5228, lng: -55.7658 },
  'PY': { lat: -23.4425, lng: -58.4438 },
  'BO': { lat: -16.2902, lng: -63.5887 },
  'EC': { lat: -1.8312, lng: -78.1834 },
  'CR': { lat: 9.7489, lng: -83.7534 },
  'PA': { lat: 8.5380, lng: -80.7821 },
  'GT': { lat: 15.7835, lng: -90.2308 },
  'HN': { lat: 15.2000, lng: -86.2419 },
  'SV': { lat: 13.7942, lng: -88.8965 },
  'NI': { lat: 12.8654, lng: -85.2072 },
  'BZ': { lat: 17.1899, lng: -88.4976 },
  'JM': { lat: 18.1096, lng: -77.2975 },
  'CU': { lat: 21.5218, lng: -77.7812 },
  'DO': { lat: 18.7357, lng: -70.1627 },
  'HT': { lat: 18.9712, lng: -72.2852 },
  'TT': { lat: 10.6918, lng: -61.2225 },
  'BB': { lat: 13.1939, lng: -59.5432 },
  'BS': { lat: 25.0343, lng: -77.3963 },
  'PR': { lat: 18.2208, lng: -66.5901 },
  'VI': { lat: 18.3358, lng: -64.8963 }
};

// World Map Component
const WorldMap: React.FC<{
  sites: SiteMonitoringDashboard[];
  onSiteClick: (site: SiteMonitoringDashboard) => void;
}> = ({ sites, onSiteClick }) => {
  const [hoveredSite, setHoveredSite] = useState<SiteMonitoringDashboard | null>(null);

  // Group sites by country for better visualization
  const sitesByCountry = sites.reduce((acc, site) => {
    if (!acc[site.country]) {
      acc[site.country] = [];
    }
    acc[site.country].push(site);
    return acc;
  }, {} as Record<string, SiteMonitoringDashboard[]>);

  const getCountryStatus = (countrySites: SiteMonitoringDashboard[]) => {
    const upSites = countrySites.filter(s => s.status === 'up').length;
    const totalSites = countrySites.length;
    const percentage = (upSites / totalSites) * 100;
    
    if (percentage === 100) return 'up';
    if (percentage >= 80) return 'warning';
    return 'down';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="relative w-full h-96 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
      {/* SVG World Map */}
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Simple world map outline */}
        <rect x="0" y="0" width="800" height="400" fill="currentColor" className="text-slate-200 dark:text-slate-700" />
        
        {/* Render site markers */}
        {Object.entries(sitesByCountry).map(([countryCode, countrySites]) => {
          const coords = COUNTRY_COORDINATES[countryCode];
          if (!coords) return null;

          // Convert lat/lng to SVG coordinates
          const x = ((coords.lng + 180) / 360) * 800;
          const y = ((90 - coords.lat) / 180) * 400;
          
          const status = getCountryStatus(countrySites);
          const color = getStatusColor(status);

          return (
            <g key={countryCode}>
              <circle
                cx={x}
                cy={y}
                r={Math.max(6, Math.min(countrySites.length * 2 + 4, 16))}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onSiteClick(countrySites[0])}
                onMouseEnter={() => setHoveredSite(countrySites[0])}
                onMouseLeave={() => setHoveredSite(null)}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="text-xs font-semibold fill-white pointer-events-none"
              >
                {countrySites.length}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredSite && (
        <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {COUNTRY_NAMES[hoveredSite.country] || hoveredSite.country}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {sitesByCountry[hoveredSite.country].length} site(s)
          </div>
          <div className="flex gap-2 mt-2">
            {sitesByCountry[hoveredSite.country].map((site) => (
              <div
                key={site.id}
                className={`w-2 h-2 rounded-full ${
                  site.status === 'up' ? 'bg-green-400' :
                  site.status === 'down' ? 'bg-red-400' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="text-xs font-medium text-gray-900 dark:text-white mb-2">Status</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">All Up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Some Down</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Many Down</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SiteMonitoringPage: React.FC<SiteMonitoringPageProps> = ({
  onNavigate,
  onLogout,
  setIsSidebarOpen,
  openSettings,
  systemStatus,
  session
}) => {
  const [sites, setSites] = useState<SiteMonitoringDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteMonitoringDashboard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up' | 'down' | 'maintenance' | 'unknown'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Fetch sites data
  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_monitoring_dashboard')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching sites:', error);
        return;
      }

      setSites(data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Real-time subscriptions for site updates
  useEffect(() => {
    const channel = supabase
      .channel('site-monitoring-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'monitored_sites'
      }, () => {
        // Refresh sites when any change occurs
        fetchSites();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSites]);

  // Add new site
  const handleAddSite = async (siteData: {
    name: string;
    url: string;
    description: string;
    country: string;
    check_interval: number;
    timeout_seconds: number;
    expected_status_code: number;
    tags: string[];
  }) => {
    try {
      const { error } = await supabase
        .from('monitored_sites')
        .insert([{
          ...siteData,
          region: null,
          latitude: null,
          longitude: null,
          status: 'unknown' as const,
          is_active: true
        }]);

      if (error) {
        throw error;
      }

      // Refresh sites list
      await fetchSites();
      
      // Show success notification
      console.log('Site added successfully');
    } catch (error) {
      console.error('Error adding site:', error);
      throw error;
    }
  };

  // Toggle site active status
  const toggleSiteStatus = async (site: SiteMonitoringDashboard) => {
    try {
      const { error } = await supabase
        .from('monitored_sites')
        .update({ is_active: !site.is_active })
        .eq('id', site.id);

      if (error) {
        throw error;
      }

      await fetchSites();
    } catch (error) {
      console.error('Error toggling site status:', error);
    }
  };

  // Delete site
  const deleteSite = async (site: SiteMonitoringDashboard) => {
    if (!confirm(`Are you sure you want to delete "${site.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('monitored_sites')
        .delete()
        .eq('id', site.id);

      if (error) {
        throw error;
      }

      await fetchSites();
      setSelectedSite(null);
    } catch (error) {
      console.error('Error deleting site:', error);
    }
  };

  // Filter sites based on search and status
  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: filteredSites.length,
    up: filteredSites.filter(s => s.status === 'up').length,
    down: filteredSites.filter(s => s.status === 'down').length,
    maintenance: filteredSites.filter(s => s.status === 'maintenance').length,
    unknown: filteredSites.filter(s => s.status === 'unknown').length,
    avgResponseTime: filteredSites
      .filter(s => s.last_response_time)
      .reduce((acc, s) => acc + (s.last_response_time || 0), 0) / 
      filteredSites.filter(s => s.last_response_time).length || 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'down': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'maintenance': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
      case 'unknown': return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <>
        <Header
          onNavigate={onNavigate}
          onLogout={onLogout}
          notifications={[]}
          setIsSidebarOpen={setIsSidebarOpen}
          openSettings={openSettings}
          systemStatus={systemStatus}
          session={session}
        />
        <main className="flex-1 overflow-y-auto lg:ml-72">
          <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        onNavigate={onNavigate}
        onLogout={onLogout}
        notifications={[]}
        setIsSidebarOpen={setIsSidebarOpen}
        openSettings={openSettings}
        systemStatus={systemStatus}
        session={session}
      />
      
      <main className="flex-1 overflow-y-auto lg:ml-72">
        <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Site Monitoring
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Monitor website uptime and performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Map
                </button>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
              >
                Add Site
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Sites
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-green-600">
                {stats.up}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Online
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-red-600">
                {stats.down}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Offline
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-amber-600">
                {stats.maintenance}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Maintenance
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-gray-600">
                {stats.avgResponseTime > 0 ? `${Math.round(stats.avgResponseTime)}ms` : '--'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Response
              </div>
            </div>
          </div>

          {/* Controls - Only show for list view */}
          {viewMode === 'list' && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="up">Online</option>
                <option value="down">Offline</option>
                <option value="maintenance">Maintenance</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          )}

          {/* Main Content */}
          {viewMode === 'map' ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <WorldMap 
                sites={filteredSites} 
                onSiteClick={(site) => setSelectedSite(site)} 
              />
              {filteredSites.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No sites to display on map
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add your first site to see it on the world map.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Sites List */
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        24h Uptime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Checked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredSites.map((site) => (
                      <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {site.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {site.url}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(site.status)}`}>
                            {site.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {COUNTRY_NAMES[site.country] || site.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {site.last_response_time ? `${site.last_response_time}ms` : '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              site.uptime_24h >= 99 ? 'bg-green-400' :
                              site.uptime_24h >= 95 ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                            {site.uptime_24h.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {site.last_checked_at 
                            ? new Date(site.last_checked_at).toLocaleString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedSite(site)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View
                            </button>
                            <button
                              onClick={() => toggleSiteStatus(site)}
                              className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                            >
                              {site.is_active ? 'Pause' : 'Resume'}
                            </button>
                            <button
                              onClick={() => deleteSite(site)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredSites.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No sites found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by adding your first site to monitor.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <div className="mt-6">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Site
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Site Modal */}
      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSite}
      />

      {/* Site Details Modal */}
      {selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedSite.name}
                </h2>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedSite.status)}`}>
                      {selectedSite.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      24h Uptime
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSite.uptime_24h.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL
                  </label>
                  <a
                    href={selectedSite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {selectedSite.url}
                  </a>
                </div>

                {selectedSite.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedSite.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {COUNTRY_NAMES[selectedSite.country] || selectedSite.country}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Response Time
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedSite.last_response_time ? `${selectedSite.last_response_time}ms` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Check Interval
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedSite.check_interval < 3600 
                        ? `${selectedSite.check_interval / 60} minutes`
                        : `${selectedSite.check_interval / 3600} hours`
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Checked
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedSite.last_checked_at 
                        ? new Date(selectedSite.last_checked_at).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>

                {selectedSite.last_error && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Error
                    </label>
                    <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {selectedSite.last_error}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <button
                    onClick={() => toggleSiteStatus(selectedSite)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      selectedSite.is_active
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {selectedSite.is_active ? 'Pause Monitoring' : 'Resume Monitoring'}
                  </button>
                  <button
                    onClick={() => deleteSite(selectedSite)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                  >
                    Delete Site
                  </button>
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="px-4 py-2 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
