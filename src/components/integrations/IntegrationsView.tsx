"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  integrationApi,
  type IntegrationConnection,
  type JiraStatusResponse,
  type SlackStatusResponse,
} from '@/lib/api/integrations';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { hasPermission } from '@/lib/permissions';
import { ToastContainer } from '@/components/shared/toast-notification';
import { Loader2, CheckCircle2, AlertTriangle, ExternalLink, Activity } from 'lucide-react';

/**
 * Three possible states for the status fetch:
 *   'loading'  — request in flight
 *   'ok'       — request succeeded; status data is authoritative
 *   'error'    — request failed; connection status is unknown
 */
type StatusState = 'loading' | 'ok' | 'error';

export default function IntegrationsView() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [slackStatus, setSlackStatus] = useState<SlackStatusResponse | null>(null);
  const [jiraStatus, setJiraStatus] = useState<JiraStatusResponse | null>(null);
  const [statusState, setStatusState] = useState<StatusState>('loading');

  const [isConnectingSlack, setIsConnectingSlack] = useState(false);
  const [isConnectingJira, setIsConnectingJira] = useState(false);
  const [disconnectingSlackId, setDisconnectingSlackId] = useState<number | string | null>(null);
  const [disconnectingJiraId, setDisconnectingJiraId] = useState<number | string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Guard: process OAuth query params exactly once per mount.
  const hasProcessedParams = useRef(false);

  const canManage = hasPermission(user?.role, 'MANAGE_INTEGRATIONS');

  // ── Status fetch ────────────────────────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    setStatusState('loading');

    // Fetch Slack status, Jira status, and general integrations in parallel
    const [slackResult, jiraResult, integrationsResult] = await Promise.allSettled([
      integrationApi.getSlackStatus(),
      integrationApi.getJiraStatus(),
      integrationApi.getIntegrations(),
    ]);

    let anySuccess = false;

    if (slackResult.status === 'fulfilled') {
      setSlackStatus(slackResult.value);
      anySuccess = true;
    } else {
      console.error('Failed to load Slack status:', slackResult.reason);
    }

    if (jiraResult.status === 'fulfilled') {
      setJiraStatus(jiraResult.value);
      anySuccess = true;
    } else {
      console.error('Failed to load Jira status:', jiraResult.reason);
    }

    if (integrationsResult.status === 'fulfilled') {
      setIntegrations(integrationsResult.value);
      anySuccess = true;
    } else {
      console.error('Failed to load integrations:', integrationsResult.reason);
    }

    if (anySuccess) {
      setStatusState('ok');
    } else {
      setStatusState('error');
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // ── OAuth return query parameter handling ───────────────────────────────────
  // Handles Slack: ?slack=connected | ?slack=failed | ?slack=cancelled
  // Handles Jira: ?jira=connected | ?jira=failed | ?jira=cancelled
  useEffect(() => {
    if (hasProcessedParams.current) return;

    const slackParam = searchParams.get('slack') || searchParams.get('slack_oauth');
    const jiraParam = searchParams.get('jira');

    if (!slackParam && !jiraParam) return;

    // Mark processed before any async work to prevent double-fire in StrictMode.
    hasProcessedParams.current = true;

    if (slackParam) {
      if (slackParam === 'connected' || slackParam === 'success') {
        setToast({
          message: 'Slack authorization completed successfully! Refreshing status…',
          type: 'success',
        });
        loadStatus();
      } else if (slackParam === 'failed' || slackParam === 'error') {
        setToast({
          message: 'Slack connection attempt failed. Please try again.',
          type: 'error',
        });
      } else if (slackParam === 'cancelled') {
        setToast({
          message: 'Slack authorization was cancelled.',
          type: 'info',
        });
      }
    }

    if (jiraParam) {
      if (jiraParam === 'connected' || jiraParam === 'success') {
        setToast({
          message: 'Jira authorization completed successfully! Refreshing status…',
          type: 'success',
        });
        loadStatus();
      } else if (jiraParam === 'failed' || jiraParam === 'error') {
        setToast({
          message: 'Jira connection attempt failed. Please try again.',
          type: 'error',
        });
      } else if (jiraParam === 'cancelled') {
        setToast({
          message: 'Jira authorization was cancelled.',
          type: 'info',
        });
      }
    }

    // Remove processed parameters from the URL without a page reload.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('slack');
      url.searchParams.delete('slack_oauth');
      url.searchParams.delete('jira');
      const remaining = url.searchParams.toString();
      const cleanPath = url.pathname + (remaining ? `?${remaining}` : '') + url.hash;
      window.history.replaceState(null, '', cleanPath);
    } catch (e) {
      console.error('Failed to clean URL:', e);
    }
  }, [searchParams, loadStatus]);

  // ── Connect handlers ────────────────────────────────────────────────────────

  const handleConnectSlack = async () => {
    setIsConnectingSlack(true);
    try {
      const res = await integrationApi.slackOAuthAuthorize();
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        throw new Error('Server did not return an authorization URL.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not start Slack connection. Please try again.';
      setToast({ message, type: 'error' });
      setIsConnectingSlack(false);
    }
  };

  const handleConnectJira = async () => {
    setIsConnectingJira(true);
    try {
      const res = await integrationApi.jiraOAuthAuthorize();
      if (res?.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        throw new Error('Server did not return an authorization URL.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not start Jira connection. Please try again.';
      setToast({ message, type: 'error' });
      setIsConnectingJira(false);
    }
  };

  // ── Disconnect handlers ─────────────────────────────────────────────────────

  const handleDisconnectSlack = async (integrationId?: number | string) => {
    setDisconnectingSlackId(integrationId ?? 'all');
    try {
      await integrationApi.disconnectSlack(integrationId);
      setToast({
        message: 'Slack disconnected.',
        type: 'success',
      });
      await loadStatus();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not disconnect Slack. Please try again.';
      setToast({ message, type: 'error' });
    } finally {
      setDisconnectingSlackId(null);
    }
  };

  const handleDisconnectJira = async (integrationId: number | string) => {
    setDisconnectingJiraId(integrationId);
    try {
      await integrationApi.disconnectJira(integrationId);
      setToast({
        message: 'Jira disconnected.',
        type: 'success',
      });
      await loadStatus();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not disconnect Jira. Please try again.';
      setToast({ message, type: 'error' });
    } finally {
      setDisconnectingJiraId(null);
    }
  };

  // ── Derive per-integration status ───────────────────────────────────────────
  const legacySlack = integrations.find((i) => i.type === 'slack');
  const isSlackConnected =
    slackStatus !== null
      ? slackStatus.connected
      : Boolean(legacySlack?.connected);
  const slackIntegrations = slackStatus?.integrations || [];

  const legacyJira = integrations.find((i) => i.type === 'jira');
  const isJiraConnected =
    jiraStatus !== null
      ? jiraStatus.connected
      : Boolean(legacyJira?.connected);
  const jiraIntegrations = jiraStatus?.integrations || [];

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (statusState === 'loading') {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-44 bg-surface-variant/40 rounded animate-pulse" />
          <div className="h-4 w-72 bg-surface-variant/30 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48 bg-surface border border-outline/20 rounded-xl animate-pulse" />
          <div className="h-48 bg-surface border border-outline/20 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Status-fetch error banner ───────────────────────────────────────────────
  const statusErrorBanner = statusState === 'error' ? (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Unable to retrieve integration status. The service may be unavailable.{' '}
        <button
          onClick={loadStatus}
          className="underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
        >
          Retry
        </button>
      </span>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <ToastContainer toast={toast} onDismiss={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold text-on-surface">Integrations</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Connect your workspace to external tools
        </p>
      </div>

      {statusErrorBanner}

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Slack Card ───────────────────────────────────────────────────── */}
        <div className="bg-surface border border-outline/20 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A154B] rounded-md flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Slack</h3>
                  {isSlackConnected && (slackIntegrations[0]?.teamName || legacySlack?.displayName || legacySlack?.workspaceName) && (
                    <p className="text-xs text-on-surface-variant font-medium">
                      Team: {slackIntegrations[0]?.teamName || legacySlack?.displayName || legacySlack?.workspaceName}
                    </p>
                  )}
                </div>
              </div>
              {statusState === 'error' ? (
                <span className="px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                  Status unknown
                </span>
              ) : isSlackConnected ? (
                <div className="flex items-center gap-2">
                  {slackIntegrations[0]?.webhookHealth && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-md flex items-center gap-1 ${
                        slackIntegrations[0].webhookHealth.toUpperCase() === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      {slackIntegrations[0].webhookHealth}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {slackIntegrations[0]?.status || 'Connected'}
                  </span>
                </div>
              ) : (
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-medium rounded-full">
                  Not connected
                </span>
              )}
            </div>

            {isSlackConnected && slackIntegrations.length > 0 ? (
              <div className="space-y-3">
                {slackIntegrations.map((item) => (
                  <div
                    key={String(item.id)}
                    className="p-3 bg-surface-variant/30 rounded-lg border border-outline/10 text-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">
                        {item.teamName || 'Slack Workspace'}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.status && (
                          <span className="text-xs text-on-surface-variant font-mono">
                            {item.status}
                          </span>
                        )}
                        {slackIntegrations.length > 1 && canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-error hover:bg-error/10"
                            onClick={() => handleDisconnectSlack(item.id)}
                            disabled={disconnectingSlackId === item.id}
                          >
                            {disconnectingSlackId === item.id && (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            )}
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                    {item.teamId && (
                      <p className="text-[11px] text-on-surface-variant/80 font-mono">
                        Team ID: {item.teamId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Receive incident alerts and sync threads directly from your Slack channels.
              </p>
            )}
          </div>

          <div className="px-6 py-4 bg-surface-variant/30 border-t border-outline/10 flex justify-end gap-3">
            {isSlackConnected ? (
              <>
                {canManage && (
                  <Button
                    variant="outline"
                    className="text-error border-error/50 hover:bg-error/10"
                    onClick={() => {
                      const targetId = slackIntegrations[0]?.id ?? legacySlack?.id;
                      handleDisconnectSlack(targetId);
                    }}
                    disabled={disconnectingSlackId !== null}
                  >
                    {disconnectingSlackId !== null && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    )}
                    Disconnect
                  </Button>
                )}
                {canManage && <Button variant="secondary">Configure</Button>}
              </>
            ) : (
              <Button
                disabled={!canManage || isConnectingSlack}
                onClick={handleConnectSlack}
              >
                {isConnectingSlack && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                )}
                Connect Slack
              </Button>
            )}
          </div>
        </div>

        {/* ── Jira Card ────────────────────────────────────────────────────── */}
        <div className="bg-surface border border-outline/20 rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0052CC] rounded-md flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Jira</h3>
                  {isJiraConnected && (jiraIntegrations[0]?.siteName || legacyJira?.displayName || legacyJira?.siteName) && (
                    <p className="text-xs text-on-surface-variant font-medium">
                      Site: {jiraIntegrations[0]?.siteName || legacyJira?.displayName || legacyJira?.siteName}
                    </p>
                  )}
                </div>
              </div>
              {statusState === 'error' ? (
                <span className="px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                  Status unknown
                </span>
              ) : isJiraConnected ? (
                <div className="flex items-center gap-2">
                  {jiraIntegrations[0]?.webhookHealth && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-md flex items-center gap-1 ${
                        jiraIntegrations[0].webhookHealth.toUpperCase() === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      {jiraIntegrations[0].webhookHealth}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-green-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {jiraIntegrations[0]?.status || 'Connected'}
                  </span>
                </div>
              ) : (
                <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-medium rounded-full">
                  Not connected
                </span>
              )}
            </div>

            {isJiraConnected && jiraIntegrations.length > 0 ? (
              <div className="space-y-3">
                {jiraIntegrations.map((item) => (
                  <div
                    key={String(item.id)}
                    className="p-3 bg-surface-variant/30 rounded-lg border border-outline/10 text-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface">
                        {item.siteName || 'Atlassian Cloud'}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.status && (
                          <span className="text-xs text-on-surface-variant font-mono">
                            {item.status}
                          </span>
                        )}
                        {jiraIntegrations.length > 1 && canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-error hover:bg-error/10"
                            onClick={() => handleDisconnectJira(item.id)}
                            disabled={disconnectingJiraId === item.id}
                          >
                            {disconnectingJiraId === item.id && (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            )}
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                    {item.siteUrl && (
                      <a
                        href={item.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {item.siteUrl}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {item.cloudId && (
                      <p className="text-[11px] text-on-surface-variant/80 font-mono">
                        Cloud ID: {item.cloudId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Automatically create and sync Jira issues for your incidents.
              </p>
            )}
          </div>

          <div className="px-6 py-4 bg-surface-variant/30 border-t border-outline/10 flex justify-end gap-3">
            {isJiraConnected ? (
              <>
                {canManage && (
                  <Button
                    variant="outline"
                    className="text-error border-error/50 hover:bg-error/10"
                    onClick={() => {
                      const targetId = jiraIntegrations[0]?.id ?? legacyJira?.id;
                      if (targetId !== undefined) {
                        handleDisconnectJira(targetId);
                      }
                    }}
                    disabled={disconnectingJiraId !== null}
                  >
                    {disconnectingJiraId !== null && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    )}
                    Disconnect
                  </Button>
                )}
                {canManage && <Button variant="secondary">Configure</Button>}
              </>
            ) : (
              <Button
                disabled={!canManage || isConnectingJira}
                onClick={handleConnectJira}
              >
                {isConnectingJira && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                )}
                Connect Jira
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
