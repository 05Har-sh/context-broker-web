"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import SystemHealth from '@/components/SystemHealth';
import PriorityQueue from '@/components/PriorityQueue';
import TrendChart from '@/components/TrendChart';
import RiskSpotlight from '@/components/RiskSpotlight';
import EventTimeline from '@/components/EventTimeline';
import ContextBreakdown from '@/components/ContextBreakdown';
import IncidentTable from '@/components/IncidentTable';
import IntegrationsModal from '@/components/IntegrationsModal';
import { useAuth } from '@/components/auth/AuthProvider';
import WelcomeSection from '@/components/onboarding/WelcomeSection';
import SetupChecklist from '@/components/onboarding/SetupChecklist';
import EmptyStateBanner from '@/components/onboarding/EmptyStateBanner';
import { DashboardEmptyState } from '@/components/onboarding/types';
import { IncidentEvent } from '@/types';

import {
  getSystemHealth,
  getMetrics,
  getHighestRisk,
  getTrend,
  getIncidentTimeline,
  getAllIncidents,
  getSeverityDistribution,
  getIncidentDetails,
} from '@/lib/api';
import { integrationApi, type IntegrationConnection } from '@/lib/api/integrations';
import { DashboardSkeleton } from '@/components/skeletons';

interface IncidentItem {
  incidentKey?: string;
  key?: string;
  summary?: string;
  lastMsg?: string;
  severity?: string;
  incidentStatus?: string;
  jiraStatus?: string;
  created?: string;
  riskScore?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);

  // Data states
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [healthReasons, setHealthReasons] = useState<string[] | null>(null);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [healthError, setHealthError] = useState(false);

  const [metrics, setMetrics] = useState<{
    total: number;
    active: number;
    critical: number;
    stale: number;
    averageRisk: number;
    resolved: number;
  } | null>(null);
  const [metricsError, setMetricsError] = useState(false);

  const [highestRisk, setHighestRisk] = useState<{
    key?: string;
    incidentKey?: string;
    summary?: string;
    calculatedRisk?: number;
    riskScore?: number;
  } | null>(null);

  const [trend, setTrend] = useState<number[] | { count: number; date: string }[]>([]);
  const [timeline, setTimeline] = useState<IncidentEvent[]>([]);
  const [allIncidents, setAllIncidents] = useState<IncidentItem[]>([]);
  const [severityData, setSeverityData] = useState<Record<string, number> | { severity: string; count: number }[] | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);

  // Checklist intelligence tracking
  const [hasViewedIntelligence, setHasViewedIntelligence] = useState(false);

  const loadDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Fire all dashboard requests plus integrations in parallel
      const [
        healthData,
        metricsData,
        riskData,
        trendData,
        incidentsData,
        severityRes,
        integrationsRes,
      ] = await Promise.allSettled([
        getSystemHealth(),
        getMetrics(),
        getHighestRisk(),
        getTrend(),
        getAllIncidents(0, 10),
        getSeverityDistribution(),
        integrationApi.getIntegrations(),
      ]);

      // Integrations
      if (integrationsRes.status === 'fulfilled' && Array.isArray(integrationsRes.value)) {
        setIntegrations(integrationsRes.value);
      } else {
        setIntegrations([]);
      }

      // System Health
      if (healthData.status === 'fulfilled' && healthData.value) {
        setHealthScore(healthData.value.score);
        setHealthReasons(healthData.value.reasons);
        setHealthStatus(healthData.value.status);
        setHealthError(false);
      } else if (healthData.status === 'rejected') {
        // If API fails, flag error state rather than showing fake 100%
        setHealthError(true);
        setHealthScore(null);
      }

      // Metrics
      if (metricsData.status === 'fulfilled' && metricsData.value) {
        setMetrics(metricsData.value);
        setMetricsError(false);
      } else if (metricsData.status === 'rejected') {
        setMetrics(null);
        setMetricsError(true);
      }

      // Highest Risk
      let hRisk = null;
      if (riskData.status === 'fulfilled' && riskData.value) {
        hRisk = riskData.value;
        setHighestRisk(hRisk);
      } else {
        setHighestRisk(null);
      }

      // Trend
      if (trendData.status === 'fulfilled' && trendData.value) {
        setTrend(trendData.value);
      } else {
        setTrend([]);
      }

      // Severity
      if (severityRes.status === 'fulfilled') {
        setSeverityData(severityRes.value ?? null);
      } else {
        setSeverityData(null);
      }

      // Incidents list
      const incidents: IncidentItem[] =
        incidentsData.status === 'fulfilled'
          ? (incidentsData.value?.content ?? [])
          : [];
      setAllIncidents(incidents);

      // Fetch timeline for highest risk incident if available
      const hRiskKey = hRisk?.incidentKey || hRisk?.key;
      if (hRiskKey) {
        const [tl, details] = await Promise.allSettled([
          getIncidentTimeline(hRiskKey),
          ((): Promise<IncidentItem | null> => {
            const match = incidents.find(
              (inc) => inc.incidentKey === hRiskKey || inc.key === hRiskKey
            );
            if (match?.summary || match?.lastMsg) return Promise.resolve(match);
            return getIncidentDetails(hRiskKey).catch(() => null);
          })(),
        ]);

        if (tl.status === 'fulfilled' && Array.isArray(tl.value)) {
          setTimeline(tl.value);
        } else {
          setTimeline([]);
        }

        if (details.status === 'fulfilled' && details.value) {
          setHighestRisk((prev) =>
            prev
              ? {
                  ...prev,
                  summary:
                    details.value!.summary ||
                    details.value!.lastMsg ||
                    prev.summary,
                }
              : prev
          );
        }
      } else {
        setTimeline([]);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Determine state machine
  const hasIntegration = integrations.some((i) => i.connected);
  const hasIntegrationVerified = integrations.some((i) => i.connected);
  const totalEventsCount = metrics?.total ?? allIncidents.length;
  const hasEvents = totalEventsCount > 0 || timeline.length > 0;
  const activeIncidentsCount =
    metrics?.active ??
    allIncidents.filter(
      (i) => i.incidentStatus !== 'RESOLVED' && i.jiraStatus !== 'Done'
    ).length;

  let emptyState: DashboardEmptyState = 'ACTIVE_DATA';
  if (!hasIntegration) {
    emptyState = 'NO_INTEGRATIONS'; // State 1
  } else if (!hasEvents) {
    emptyState = 'INTEGRATION_CONNECTED_NO_EVENTS'; // State 2
  } else if (activeIncidentsCount === 0) {
    emptyState = 'EVENTS_NO_ACTIVE_INCIDENTS'; // State 3
  } else {
    emptyState = 'ACTIVE_DATA';
  }

  // Handle checklist view intelligence
  useEffect(() => {
    if (hasEvents && activeIncidentsCount > 0) {
      setHasViewedIntelligence(true);
    }
  }, [hasEvents, activeIncidentsCount]);

  if (loading) {
    return (
      <div className="flex pt-16">
        <TopBar />
        <Sidebar />
        <main className="flex-1 bg-surface p-8 lg:px-12 max-w-7xl mx-auto w-full">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  const activeIncidentKey =
    highestRisk?.incidentKey ||
    highestRisk?.key ||
    allIncidents[0]?.incidentKey ||
    allIncidents[0]?.key;

  const handleOpenConnect = () => {
    setIsIntegrationsModalOpen(true);
  };

  const handleViewStatus = () => {
    router.push('/settings/integrations');
  };

  const handleViewHistory = () => {
    router.push('/dashboard/incidents');
  };

  const handleExploreDashboard = () => {
    setHasViewedIntelligence(true);
    const element = document.getElementById('dashboard-intelligence');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleModalClose = () => {
    setIsIntegrationsModalOpen(false);
    // Reload dashboard silently to reflect newly connected integrations
    loadDashboard(true);
  };

  const userName = user?.firstName || user?.name;

  return (
    <div className="flex pt-16">
      <TopBar />
      <Sidebar />
      <main className="flex-1 bg-surface p-8 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Onboarding Welcome Section (Shown when no integrations or no events) */}
        {(emptyState === 'NO_INTEGRATIONS' || emptyState === 'INTEGRATION_CONNECTED_NO_EVENTS') && (
          <WelcomeSection
            userName={userName}
            onConnectClick={handleOpenConnect}
          />
        )}

        {/* Getting Started Checklist (Shown in Onboarding and All Clear states) */}
        {emptyState !== 'ACTIVE_DATA' && (
          <SetupChecklist
            hasIntegration={hasIntegration}
            hasIntegrationVerified={hasIntegrationVerified}
            hasEvents={hasEvents}
            hasViewedIntelligence={hasViewedIntelligence}
            onConnectClick={handleOpenConnect}
            onViewStatusClick={handleViewStatus}
            onExploreDashboardClick={handleExploreDashboard}
          />
        )}

        {/* Dedicated Empty State Banner (handles the 3 distinct states) */}
        <EmptyStateBanner
          emptyState={emptyState}
          onConnectClick={handleOpenConnect}
          onViewStatusClick={handleViewStatus}
          onViewHistoryClick={handleViewHistory}
          onRefreshClick={() => loadDashboard(true)}
          isRefreshing={isRefreshing}
        />

        {/* Section 1: System Health & Risk */}
        <div id="dashboard-intelligence">
          <SystemHealth
            score={healthScore}
            reasons={healthReasons}
            status={healthStatus}
            metrics={metrics}
            emptyState={emptyState}
            onConnectClick={handleOpenConnect}
            isError={healthError || metricsError}
            onRetry={() => loadDashboard(true)}
          />
        </div>

        {/* Section 2: Incident Intelligence */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 lg:col-span-5">
            <PriorityQueue
              incidents={allIncidents.length > 0 ? allIncidents : null}
              emptyState={emptyState}
              onConnectClick={handleOpenConnect}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <TrendChart trend={trend} />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <RiskSpotlight
              highestRiskIncident={highestRisk}
              onConnectClick={handleOpenConnect}
            />
          </div>
        </div>

        {/* Section 3: Visualizations & Details */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 lg:col-span-4">
            <EventTimeline
              events={timeline.length > 0 ? timeline : null}
              compact
              incidentKey={activeIncidentKey}
              emptyState={emptyState}
              onConnectClick={handleOpenConnect}
            />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ContextBreakdown
              severityData={severityData}
              onConnectClick={handleOpenConnect}
            />
          </div>
        </div>

        {/* Section 4: Database Table */}
        <IncidentTable
          incidents={allIncidents.length > 0 ? allIncidents : null}
          emptyState={emptyState}
          onConnectClick={handleOpenConnect}
        />
      </main>

      {/* Embedded Integrations Modal for seamless connection flow */}
      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
