"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import { auditApi, AuditEvent } from '@/lib/api/audit';
import { useEffect, useState } from 'react';
import { hasPermission } from '@/lib/permissions';

export default function AuditLogPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canView = hasPermission(user?.role, 'VIEW_AUDIT_LOG');

  useEffect(() => {
    async function loadEvents() {
      if (!canView) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await auditApi.getAuditEvents();
        setEvents(data.content);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, [canView]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface border border-outline/20 rounded-xl">
        <h2 className="text-xl font-bold text-on-surface">Access Denied</h2>
        <p className="text-sm text-on-surface-variant mt-2 text-center max-w-md">
          You do not have permission to view the audit log. Please contact your workspace administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Security & Audit Log</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review security events and workspace activity</p>
      </div>

      <div className="bg-surface border border-outline/20 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading audit log...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">No security events found.</div>
        ) : (
          <div className="divide-y divide-outline/10">
            {events.map(event => (
              <div key={event.id} className="p-4 hover:bg-surface-variant/20 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${event.status === 'SUCCESS' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                        {event.status}
                      </span>
                      <p className="font-medium text-on-surface text-sm">{event.type}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant">{event.description}</p>
                    <p className="text-xs font-mono text-on-surface-variant/70 mt-1">Actor: {event.actor}</p>
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
