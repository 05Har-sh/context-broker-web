import { analyticsApi } from '@/lib/api/analytics';
import TrendChart from '@/components/TrendChart';

export default async function AnalyticsPage() {
  const metrics = await analyticsApi.getMetrics().catch(() => null);
  const severityData = await analyticsApi.getSeverityDistribution().catch(() => []);
  const trendData = await analyticsApi.getTrend().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Analytics</h1>
        <p className="text-sm text-on-surface-variant mt-1">Incident trends and distribution metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Total Incidents</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{metrics?.total || 0}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Active Incidents</p>
          <p className="text-3xl font-bold text-on-surface mt-2">{metrics?.active || 0}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Critical Incidents</p>
          <p className="text-3xl font-bold text-[#c62828] mt-2">{metrics?.critical || 0}</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <p className="text-sm font-medium text-on-surface-variant">Average Risk Score</p>
          <p className="text-3xl font-bold text-[#ef6c00] mt-2">{metrics?.averageRisk || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6">Incident Volume Trend</h3>
          <div className="h-64">
            <TrendChart trend={trendData} />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline/10 shadow-sm">
          <h3 className="text-lg font-bold text-on-surface mb-6">Severity Distribution</h3>
          <div className="space-y-4">
            {severityData.length > 0 ? severityData.map(item => (
              <div key={item.severity} className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">{item.severity}</span>
                <span className="text-sm font-bold text-on-surface-variant bg-surface-variant/30 px-3 py-1 rounded-full">
                  {item.count}
                </span>
              </div>
            )) : (
              <p className="text-sm text-on-surface-variant">No severity data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
