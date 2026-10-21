"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import EventTimeline from '@/components/EventTimeline';
import { incidentApi } from '@/lib/api/incidents';
import { IncidentItem, IncidentEvent } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function getSeverityColor(severity?: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return { bg: '#fee2e2', text: '#dc2626' };
    case 'HIGH':     return { bg: '#ffedd5', text: '#ea580c' };
    case 'MEDIUM':   return { bg: '#fef9c3', text: '#ca8a04' };
    case 'LOW':      return { bg: '#dcfce7', text: '#16a34a' };
    default:         return { bg: '#f1f5f9', text: '#64748b' };
  }
}

function getStatusColor(status?: string) {
  switch (status?.toUpperCase()) {
    case 'IN_PROGRESS': return { bg: 'transparent', text: '#16a34a', border: '#16a34a' };
    case 'RESOLVED':    return { bg: 'transparent', text: '#2563eb', border: '#2563eb' };
    case 'CREATED':     return { bg: 'transparent', text: '#9333ea', border: '#9333ea' };
    default:            return { bg: 'transparent', text: '#64748b', border: '#94a3b8' };
  }
}

function statusLabel(status?: string) {
  switch (status?.toUpperCase()) {
    case 'IN_PROGRESS': return 'In Progress';
    case 'RESOLVED':    return 'Resolved';
    case 'CREATED':     return 'Created';
    default:            return status ?? 'Unknown';
  }
}

import { IncidentDetailSkeleton } from '@/components/skeletons';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IncidentDetailsPage({ params }: { params: Promise<{ incidentKey: string }> }) {
  const { incidentKey } = use(params);
  const router = useRouter();

  const [incident, setIncident] = useState<IncidentItem | null>(null);
  const [timeline, setTimeline] = useState<IncidentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!incidentKey) return;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      incidentApi.getIncidentDetails(incidentKey)
        .catch(() => incidentApi.getIncident(incidentKey).catch(() => null)),
      incidentApi.getIncidentTimeline(incidentKey).catch(() => []),
    ]).then(([inc, tl]) => {
      setIncident(inc);
      setTimeline([...(tl ?? [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      if (!inc) setNotFound(true);
    }).finally(() => setLoading(false));
  }, [incidentKey]);

  if (loading) {
    return (
      <div className="flex pt-16">
        <TopBar />
        <Sidebar />
        <main className="flex-1 bg-surface overflow-y-auto">
          <div style={{ padding: '24px 40px', maxWidth: 860, margin: '0 auto', fontFamily: 'inherit' }}>
            <IncidentDetailSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !incident) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Incident Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>
          The incident <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{incidentKey}</code> could not be loaded.
        </p>
        <button
          onClick={() => router.push('/dashboard/incidents')}
          style={{ border: '1px solid #cbd5e1', background: '#fff', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
        >
          ← Back to Incidents
        </button>
      </div>
    );
  }

  const severityStyle = getSeverityColor(incident.severity);
  const statusStyle   = getStatusColor(incident.incidentStatus);

  return (
    <div className="flex pt-16">
      <TopBar />
      <Sidebar />
      <main className="flex-1 bg-surface overflow-y-auto">
        <div style={{ padding: '24px 40px', maxWidth: 860, margin: '0 auto', fontFamily: 'inherit' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 28 }}>
            <Link href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>Workspaces</Link>
            <span>›</span>
            <Link href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>Context Broker</Link>
            <span>›</span>
            <Link href="/dashboard/incidents" style={{ color: '#3b82f6', textDecoration: 'none' }}>Repository</Link>
            <span>›</span>
            <span style={{ color: '#1e293b', fontWeight: 600 }}>{incident.incidentKey ?? incidentKey}</span>
          </nav>

          {/* Title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              {incident.incidentKey ?? incidentKey}: {incident.summary ?? 'Untitled Incident'}
            </h1>
          </div>

          {/* Info card */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '24px 28px',
            marginBottom: 36,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            {/* 4-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
              {/* Priority */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>PRIORITY</p>
                <span style={{
                  display: 'inline-block',
                  background: severityStyle.bg,
                  color: severityStyle.text,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '4px 12px',
                  borderRadius: 999,
                }}>
                  {incident.severity ? incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1).toLowerCase() : 'Unknown'}
                </span>
              </div>

              {/* Status */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>STATUS</p>
                <span style={{
                  display: 'inline-block',
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${statusStyle.border}`,
                }}>
                  {statusLabel(incident.incidentStatus)}
                </span>
              </div>

              {/* Severity Score */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>SEVERITY SCORE</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {incident.riskScore ?? '—'}
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8', marginLeft: 2 }}>/100</span>
                </p>
              </div>

              {/* Assigned To */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>ASSIGNED TO</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#0f172a', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(incident.assignedTo ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {incident.assignedTo ?? 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>DESCRIPTION</p>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, margin: 0 }}>
                {incident.lastMsg || incident.summary || 'No description available.'}
              </p>
            </div>
          </div>

          {/* Audit Timeline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Audit Timeline</h2>
            </div>

            <EventTimeline events={timeline} />
          </div>

        </div>
      </main>
    </div>
  );
}
