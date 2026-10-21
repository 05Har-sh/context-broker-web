import { apiClient } from './client';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface IntegrationConnection {
  id: number;
  type: 'slack' | 'jira';
  connected: boolean;
  /** Display name returned by the backend (workspace name for Slack, site URL for Jira) */
  displayName?: string;
  /** @deprecated — use displayName. Kept for backward compat with templates. */
  workspaceName?: string;
  /** @deprecated — use displayName. Kept for backward compat with templates. */
  siteName?: string;
  /** Slack: team ID */
  teamId?: string;
  /** Jira: webhook ID */
  jiraWebhookId?: string;
  connectedAt?: string;
  lastSynced?: string;
}

/** Raw shape returned by GET /integrations */
interface RawIntegrationConnection {
  id: number;
  type: string;
  connected: boolean;
  displayName?: string;
  [key: string]: unknown;
}

export interface OAuthAuthorizeResponse {
  authorizationUrl: string;
}

export interface SlackManualPayload {
  teamId: string;
  signingSecret: string;
}

export interface JiraManualPayload {
  jiraWebhookId: string;
  webhookSecret: string;
}

export interface SlackIntegrationItem {
  id: number | string;
  teamName?: string;
  teamId?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  webhookHealth?: string;
}

export interface SlackStatusResponse {
  connected: boolean;
  count: number;
  integrations: SlackIntegrationItem[];
}

export interface SlackDisconnectResponse {
  disconnected: boolean;
  integrationId?: number | string;
  status?: string;
}

export interface JiraIntegrationItem {
  id: number | string;
  siteName?: string;
  siteUrl?: string;
  status: string;
  webhookHealth?: string;
  cloudId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JiraStatusResponse {
  connected: boolean;
  count: number;
  integrations: JiraIntegrationItem[];
}

// ─── API Functions ──────────────────────────────────────────────────────────────

export const integrationApi = {
  /**
   * Fetch all connected integrations for the current workspace.
   * GET /integrations
   *
   * Backend returns uppercase type ("SLACK", "JIRA") and a `displayName` field.
   * We normalize to lowercase and map displayName → workspaceName / siteName
   * so existing UI code continues to work.
   */
  getIntegrations: async (): Promise<IntegrationConnection[]> => {
    const raw = await apiClient<RawIntegrationConnection[]>('/integrations');
    return raw.map((item) => {
      const typeLower = item.type.toLowerCase() as 'slack' | 'jira';
      return {
        ...item,
        type: typeLower,
        // Map displayName to the legacy field the UI reads
        workspaceName: typeLower === 'slack' ? item.displayName : undefined,
        siteName: typeLower === 'jira' ? item.displayName : undefined,
      };
    });
  },

  // ── OAuth Flows ─────────────────────────────────────────────────────────────

  /**
   * Begin the Slack OAuth flow.
   * GET /integrations/slack/oauth/authorize
   * Returns { authorizationUrl: "https://slack.com/oauth/v2/authorize?..." }
   */
  slackOAuthAuthorize: async (): Promise<OAuthAuthorizeResponse> => {
    return apiClient('/integrations/slack/oauth/authorize');
  },

  /**
   * Fetch Slack connection status.
   * GET /integrations/slack/status
   */
  getSlackStatus: async (): Promise<SlackStatusResponse> => {
    return apiClient('/integrations/slack/status');
  },

  /**
   * Begin the Jira OAuth flow.
   * GET /integrations/jira/oauth/authorize
   * Returns { authorizationUrl: "https://auth.atlassian.com/authorize?..." }
   */
  jiraOAuthAuthorize: async (): Promise<OAuthAuthorizeResponse> => {
    return apiClient('/integrations/jira/oauth/authorize');
  },

  /**
   * Fetch Jira connection status.
   * GET /integrations/jira/status
   */
  getJiraStatus: async (): Promise<JiraStatusResponse> => {
    return apiClient('/integrations/jira/status');
  },

  // ── Manual Setup ────────────────────────────────────────────────────────────

  /**
   * Connect Slack manually via team ID + signing secret.
   * POST /integrations/slack
   * Body: { teamId, signingSecret }
   */
  connectSlackManual: async (payload: SlackManualPayload): Promise<IntegrationConnection> => {
    return apiClient('/integrations/slack', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Connect Jira manually via webhook ID + webhook secret.
   * POST /integrations/jira
   * Body: { jiraWebhookId, webhookSecret }
   */
  connectJiraManual: async (payload: JiraManualPayload): Promise<IntegrationConnection> => {
    return apiClient('/integrations/jira', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ── Disconnect ──────────────────────────────────────────────────────────────

  /**
   * Disconnect Slack integration.
   * DELETE /integrations/slack
   */
  disconnectSlack: async (_id?: number | string): Promise<SlackDisconnectResponse> => {
    return apiClient('/integrations/slack', {
      method: 'DELETE',
    });
  },

  /**
   * Disconnect Jira integration.
   * DELETE /integrations/jira/{integrationId}
   */
  disconnectJira: async (integrationId: number | string): Promise<void> => {
    return apiClient(`/integrations/jira/${integrationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Disconnect an integration.
   * DELETE /integrations/slack or DELETE /integrations/jira/{id}
   */
  disconnectIntegration: async (id: number | string, type?: 'slack' | 'jira'): Promise<void> => {
    if (type === 'slack' || id === 'slack') {
      return apiClient('/integrations/slack', { method: 'DELETE' });
    }
    return apiClient(`/integrations/jira/${id}`, {
      method: 'DELETE',
    });
  },
};
