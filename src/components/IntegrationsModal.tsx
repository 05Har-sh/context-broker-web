"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Puzzle,
  Webhook,
  Sliders,
  Trash2,
  RefreshCw,
  Loader2,
  Link2,
  Settings,
  Unplug,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { integrationApi, type IntegrationConnection } from "@/lib/api/integrations";

// ─── Props ──────────────────────────────────────────────────────────────────────

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = "connected_apps" | "my_integrations" | "webhooks";

// ─── Integration catalog definition (only Slack & Jira) ─────────────────────

interface IntegrationCatalogItem {
  id: "slack" | "jira";
  name: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Receive Slack events and analyze incidents",
    icon: MessageSquare,
    iconBg: "bg-[#4A154B]/5 border-[#4A154B]/10",
    iconColor: "text-[#4A154B]",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Monitor Jira issue updates",
    icon: FileCheck,
    iconBg: "bg-[#0052CC]/5 border-[#0052CC]/10",
    iconColor: "text-[#0052CC]",
  },
];

// ─── Webhook list (static for now) ──────────────────────────────────────────

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  status: "Healthy" | "Failing";
  lastTriggered: string;
}

const initialWebhooks: WebhookItem[] = [
  {
    id: "wh-1",
    url: "https://api.contextbroker.io/v1/telemetry/ingest",
    events: ["incident.created", "incident.resolved"],
    status: "Healthy",
    lastTriggered: "10 mins ago",
  },
];

// ─── Manual Setup Field Configs ─────────────────────────────────────────────

interface ManualField {
  key: string;
  label: string;
  placeholder: string;
  isSecret?: boolean;
}

const MANUAL_FIELDS: Record<string, ManualField[]> = {
  slack: [
    { key: "teamId", label: "Workspace / Team ID", placeholder: "T0123456789" },
    { key: "signingSecret", label: "Signing Secret", placeholder: "Enter your Slack signing secret", isSecret: true },
  ],
  jira: [
    { key: "jiraWebhookId", label: "Jira Webhook ID", placeholder: "Enter your Jira webhook ID" },
    { key: "webhookSecret", label: "Webhook Secret", placeholder: "Enter your webhook secret", isSecret: true },
  ],
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("connected_apps");
  const [searchQuery, setSearchQuery] = useState("");
  const [webhooks] = useState<WebhookItem[]>(initialWebhooks);

  // Connection state fetched from backend
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Manual setup sub-modal state
  const [manualSetupFor, setManualSetupFor] = useState<IntegrationCatalogItem | null>(null);
  const [manualFormValues, setManualFormValues] = useState<Record<string, string>>({});
  const [manualFormError, setManualFormError] = useState<string | null>(null);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // OAuth loading state
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Fetch connections from backend ────────────────────────────────────────

  const fetchConnections = useCallback(async () => {
    setIsLoadingConnections(true);
    try {
      const data = await integrationApi.getIntegrations();
      setConnections(data);
    } catch (err) {
      console.error("Failed to fetch integrations:", err);
      // Allow working in disconnected state — keep empty
      setConnections([]);
    } finally {
      setIsLoadingConnections(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchConnections();

      const slackStatus = searchParams.get('slack') || searchParams.get('slack_oauth');
      if (slackStatus) {
        if (slackStatus === 'cancelled') {
          showToast("Slack connection was cancelled.");
        } else if (slackStatus === 'failed' || slackStatus === 'error') {
          showToast("Slack connection failed. Please try again.", true);
        } else if (slackStatus === 'connected' || slackStatus === 'success') {
          showToast("Slack connected successfully!");
          setActiveTab("my_integrations");
        }

        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('slack');
        newParams.delete('slack_oauth');
        const cleanQuery = newParams.toString();
        window.history.replaceState(null, '', `${pathname}${cleanQuery ? `?${cleanQuery}` : ''}`);
      }

      const jiraStatus = searchParams.get('jira');
      if (jiraStatus) {
        if (jiraStatus === 'cancelled') {
          showToast("Jira connection was cancelled.");
        } else if (jiraStatus === 'failed' || jiraStatus === 'error') {
          showToast("Jira connection failed. Please try again.", true);
        } else if (jiraStatus === 'connected' || jiraStatus === 'success') {
          showToast("Jira connected successfully!");
          setActiveTab("my_integrations");
        }

        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('jira');
        const cleanQuery = newParams.toString();
        window.history.replaceState(null, '', `${pathname}${cleanQuery ? `?${cleanQuery}` : ''}`);
      }
    }
  }, [isOpen, fetchConnections, searchParams, pathname, router]);

  // Utility: find connection by type
  const getConnection = (type: "slack" | "jira"): IntegrationConnection | undefined =>
    connections.find((c) => c.type === type && c.connected);

  // ── OAuth flow handlers ───────────────────────────────────────────────────

  const handleOAuthConnect = async (type: "slack" | "jira") => {
    setOauthLoading(type);
    try {
      const authorizeEndpoint =
        type === "slack"
          ? integrationApi.slackOAuthAuthorize
          : integrationApi.jiraOAuthAuthorize;

      const response = await authorizeEndpoint();

      if (response.authorizationUrl) {
        // Redirect user to the OAuth provider
        window.location.href = response.authorizationUrl;
      }
    } catch (err: any) {
      console.error(`OAuth authorize error for ${type}:`, err);
      showToast(
        err?.message || `Failed to start ${type === "slack" ? "Slack" : "Jira"} OAuth flow. Please try Manual Setup instead.`,
        true
      );
    } finally {
      setOauthLoading(null);
    }
  };

  // ── Manual Setup handlers ─────────────────────────────────────────────────

  const openManualSetup = (item: IntegrationCatalogItem) => {
    setManualSetupFor(item);
    setManualFormValues({});
    setManualFormError(null);
    setShowSecrets({});
  };

  const handleManualSubmit = async () => {
    if (!manualSetupFor) return;

    const fields = MANUAL_FIELDS[manualSetupFor.id];
    // Validate all fields are filled
    for (const field of fields) {
      if (!manualFormValues[field.key]?.trim()) {
        setManualFormError(`${field.label} is required.`);
        return;
      }
    }

    setIsSubmittingManual(true);
    setManualFormError(null);

    try {
      if (manualSetupFor.id === "slack") {
        await integrationApi.connectSlackManual({
          teamId: manualFormValues.teamId.trim(),
          signingSecret: manualFormValues.signingSecret.trim(),
        });
      } else {
        await integrationApi.connectJiraManual({
          jiraWebhookId: manualFormValues.jiraWebhookId.trim(),
          webhookSecret: manualFormValues.webhookSecret.trim(),
        });
      }

      showToast(`${manualSetupFor.name} connected successfully!`);
      setManualSetupFor(null);
      // Refresh connection list
      await fetchConnections();
    } catch (err: any) {
      console.error("Manual setup error:", err);
      setManualFormError(
        err?.message || `Failed to connect ${manualSetupFor.name}. Please check your credentials.`
      );
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // ── Disconnect handler ────────────────────────────────────────────────────

  const handleDisconnect = async (connection: IntegrationConnection) => {
    try {
      if (connection.type === "slack") {
        await integrationApi.disconnectSlack(connection.id);
      } else if (connection.type === "jira") {
        await integrationApi.disconnectJira(connection.id);
      } else {
        await integrationApi.disconnectIntegration(connection.id);
      }
      showToast(`Disconnected ${connection.type === "slack" ? "Slack" : "Jira"}`);
      await fetchConnections();
    } catch (err: any) {
      console.error("Disconnect error:", err);
      showToast(err?.message || "Failed to disconnect integration", true);
    }
  };

  // ── Filtered catalog for search ───────────────────────────────────────────

  const filteredCatalog = INTEGRATION_CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Integrations Window"
    >
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "absolute top-6 z-[80] px-4 py-3 rounded-md shadow-xl text-xs font-semibold flex items-center gap-2.5 border",
              toastIsError
                ? "bg-red-950 text-red-200 border-red-800/30"
                : "bg-on-surface text-surface border-outline-variant/30"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                toastIsError
                  ? "bg-red-800 text-red-200"
                  : "bg-secondary-container text-on-secondary-container"
              )}
            >
              {toastIsError ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="w-full max-w-5xl bg-surface-container-lowest shadow-[0_0_1px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.12)] flex flex-col md:flex-row h-[82vh] max-h-[720px] min-h-[560px] border border-outline-variant/20 rounded-lg overflow-hidden font-body relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Sidebar */}
        <aside className="w-full md:w-56 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant/15 p-4 flex flex-col gap-1 shrink-0">
          <div className="px-3 py-2 text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-1">
            Integrations &amp; Apps
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("connected_apps")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[13px] rounded-[3px] transition-all whitespace-nowrap",
                activeTab === "connected_apps"
                  ? "bg-surface-container-lowest shadow-sm border border-outline-variant/10 text-on-surface font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Puzzle
                className={cn(
                  "h-4 w-4",
                  activeTab === "connected_apps" ? "text-secondary" : "text-on-surface-variant"
                )}
              />
              <span>Connect Apps</span>
            </button>

            <button
              onClick={() => setActiveTab("my_integrations")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[13px] rounded-[3px] transition-all whitespace-nowrap",
                activeTab === "my_integrations"
                  ? "bg-surface-container-lowest shadow-sm border border-outline-variant/10 text-on-surface font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Link2
                className={cn(
                  "h-4 w-4",
                  activeTab === "my_integrations" ? "text-secondary" : "text-on-surface-variant"
                )}
              />
              <span>My Integrations</span>
            </button>

            <button
              onClick={() => setActiveTab("webhooks")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[13px] rounded-[3px] transition-all whitespace-nowrap",
                activeTab === "webhooks"
                  ? "bg-surface-container-lowest shadow-sm border border-outline-variant/10 text-on-surface font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Webhook className="h-4 w-4 text-on-surface-variant" />
              <span>Webhooks</span>
            </button>
          </nav>

          <div className="hidden md:block mt-auto pt-4 border-t border-outline-variant/15 px-3">
            <div className="text-[11px] text-on-surface-variant/70 font-medium">
              Context Broker v2.4
            </div>
            <div className="text-[10px] text-on-surface-variant/50 mt-0.5">
              Organization: Ops-Intel Main
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-10 flex flex-col gap-6 bg-surface-container-lowest overflow-y-auto no-scrollbar">
          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: CONNECT APPS — Card-based layout matching the image
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "connected_apps" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 h-full justify-between"
            >
              <div>
                {/* Header */}
                <header className="mb-6">
                  <h2 className="text-2xl font-semibold text-on-surface tracking-tight">
                    Integrations
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Connect your tools to receive events and analyze incidents.
                  </p>
                </header>

                {/* Search Bar */}
                <div className="relative max-w-md mb-6">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-outline-variant" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search available integrations..."
                    className="w-full bg-transparent border-0 border-b border-outline-variant/20 py-2 pl-7 pr-3 text-sm text-on-surface focus:outline-none focus:border-secondary transition-all placeholder:text-outline-variant/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Integration Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {filteredCatalog.map((item) => {
                    const IconComp = item.icon;
                    const connection = getConnection(item.id);
                    const isConnected = !!connection;
                    const isOAuthLoading = oauthLoading === item.id;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "p-5 border transition-all duration-200 flex flex-col justify-between rounded-md bg-surface-container-lowest group relative",
                          isConnected
                            ? "border-outline-variant/25 border-l-[3px] border-l-secondary"
                            : "border-outline-variant/15 hover:border-outline-variant/35"
                        )}
                      >
                        {/* Card Header: Icon + Name */}
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-10 h-10 flex items-center justify-center rounded-lg border",
                                  item.iconBg
                                )}
                              >
                                <IconComp className={cn("h-5 w-5", item.iconColor)} />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-on-surface">
                                  {item.name}
                                </h3>
                                <p className="text-[12px] text-on-surface-variant leading-snug mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status Line */}
                          <div className="mt-2 mb-4 flex items-center gap-2 text-xs">
                            {isConnected ? (
                              <span className="flex items-center gap-1.5 text-on-secondary-container font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Connected
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-on-surface-variant/70">
                                <span className="w-2 h-2 rounded-full bg-outline-variant/40" />
                                Not connected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-outline-variant/10 flex items-center gap-2">
                          {isConnected ? (
                            <>
                              <button
                                onClick={() => {
                                  setActiveTab("my_integrations");
                                }}
                                className="flex-1 py-2 text-[13px] font-medium border border-outline-variant/20 hover:bg-surface-container transition-colors rounded-[3px] text-on-surface flex items-center justify-center gap-1.5"
                              >
                                <Settings className="h-3.5 w-3.5 text-on-surface-variant" />
                                Configure
                              </button>
                              <button
                                onClick={() => handleDisconnect(connection)}
                                className="flex-1 py-2 text-[13px] font-medium border border-outline-variant/20 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-[3px] text-on-surface flex items-center justify-center gap-1.5"
                              >
                                <Unplug className="h-3.5 w-3.5 text-on-surface-variant" />
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOAuthConnect(item.id)}
                                disabled={isOAuthLoading}
                                className="flex-1 py-2 text-[13px] font-bold bg-[#bbf7d0] text-[#14532d] hover:bg-[#a3e635] transition-colors rounded-md shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                              >
                                {isOAuthLoading ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    Connect {item.name}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => openManualSetup(item)}
                                className="py-2 px-3.5 text-[13px] font-medium border border-outline-variant/20 hover:bg-surface-container transition-colors rounded-md text-on-surface flex items-center justify-center gap-1.5"
                              >
                                Manual Setup
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCatalog.length === 0 && (
                    <div className="col-span-full py-12 text-center text-on-surface-variant text-sm">
                      No integrations match &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex gap-4">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("Navigating to Documentation...");
                    }}
                    className="text-[12px] font-medium text-secondary hover:underline transition-all flex items-center gap-1"
                  >
                    Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("Navigating to Developer Portal...");
                    }}
                    className="text-[12px] font-medium text-secondary hover:underline transition-all flex items-center gap-1"
                  >
                    Developer Portal
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: MY INTEGRATIONS — Shows real connection data
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "my_integrations" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 h-full"
            >
              <header className="mb-2">
                <h2 className="text-2xl font-semibold text-on-surface tracking-tight mb-1.5">
                  Connected Integrations
                </h2>
                <p className="text-[14px] text-on-surface-variant leading-relaxed">
                  Manage your active connections and their settings.
                </p>
              </header>

              {isLoadingConnections ? (
                <div className="py-12 text-center text-on-surface-variant text-sm flex flex-col items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                  Loading connections...
                </div>
              ) : (
                <div className="space-y-4">
                  {connections
                    .filter((c) => c.connected)
                    .map((conn) => {
                      const catalogItem = INTEGRATION_CATALOG.find((i) => i.id === conn.type);
                      if (!catalogItem) return null;
                      const IconComp = catalogItem.icon;

                      return (
                        <div
                          key={conn.id}
                          className="p-5 border border-outline-variant/15 rounded-md bg-surface-container-lowest border-l-[3px] border-l-secondary"
                        >
                          {/* Top row: Icon + Name + Connected badge */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-9 h-9 flex items-center justify-center rounded-lg border",
                                  catalogItem.iconBg
                                )}
                              >
                                <IconComp className={cn("h-4.5 w-4.5", catalogItem.iconColor)} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-on-surface text-sm">
                                  {catalogItem.name}
                                </h3>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-container flex items-center gap-1 shadow-sm">
                              <Check className="h-3 w-3" />
                              Connected
                            </span>
                          </div>

                          {/* Connection details */}
                          <div className="mt-3 ml-12 space-y-1 text-[13px] text-on-surface-variant">
                            {conn.type === "slack" && (conn.displayName || conn.workspaceName) && (
                              <div>
                                <span className="text-on-surface-variant/70">Workspace: </span>
                                <span className="font-medium text-on-surface">{conn.displayName || conn.workspaceName}</span>
                              </div>
                            )}
                            {conn.type === "slack" && conn.teamId && !conn.displayName && !conn.workspaceName && (
                              <div>
                                <span className="text-on-surface-variant/70">Team ID: </span>
                                <span className="font-mono text-[11px] font-medium text-on-surface">{conn.teamId}</span>
                              </div>
                            )}
                            {conn.type === "jira" && (conn.displayName || conn.siteName) && (
                              <div>
                                <span className="text-on-surface-variant/70">Site: </span>
                                <span className="font-medium text-on-surface">{conn.displayName || conn.siteName}</span>
                              </div>
                            )}
                            {conn.type === "jira" && conn.jiraWebhookId && !conn.displayName && !conn.siteName && (
                              <div>
                                <span className="text-on-surface-variant/70">Webhook ID: </span>
                                <span className="font-mono text-[11px] font-medium text-on-surface">{conn.jiraWebhookId}</span>
                              </div>
                            )}
                            {conn.connectedAt && (
                              <div className="text-[12px] text-on-surface-variant/60">
                                Connected: {new Date(conn.connectedAt).toLocaleDateString()}
                              </div>
                            )}
                            {conn.lastSynced && (
                              <div className="text-[12px] text-on-surface-variant/60">
                                Last event: {conn.lastSynced}
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                              onClick={() => showToast(`Opening ${catalogItem.name} configuration...`)}
                              className="text-xs font-medium py-1.5 px-3 border border-outline-variant/20 rounded hover:bg-surface-container transition-colors text-on-surface flex items-center gap-1.5"
                            >
                              <Sliders className="h-3.5 w-3.5 text-on-surface-variant" />
                              Configure
                            </button>
                            <button
                              onClick={() => handleDisconnect(conn)}
                              className="text-xs font-medium py-1.5 px-3 border border-outline-variant/20 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-on-surface flex items-center gap-1.5"
                            >
                              <Unplug className="h-3.5 w-3.5 text-on-surface-variant" />
                              Disconnect
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {connections.filter((c) => c.connected).length === 0 && (
                    <div className="py-12 border border-dashed border-outline-variant/20 rounded-md text-center bg-surface-container-low/50">
                      <p className="text-on-surface-variant text-sm">
                        No integrations connected yet.
                      </p>
                      <button
                        onClick={() => setActiveTab("connected_apps")}
                        className="mt-3 text-sm text-secondary hover:underline"
                      >
                        Go to Connect Apps
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: WEBHOOKS
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "webhooks" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-on-surface tracking-tight mb-1.5">
                  Webhooks
                </h2>
                <p className="text-[14px] text-on-surface-variant leading-relaxed">
                  Deliver real-time incident event payloads to your HTTP endpoint.
                </p>
              </div>

              <div className="space-y-4">
                {webhooks.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 border border-outline-variant/15 rounded-md bg-surface-container-lowest space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-on-surface">
                        {w.url}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                        {w.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                      <span>Events:</span>
                      {w.events.map((ev) => (
                        <span
                          key={ev}
                          className="px-1.5 py-0.5 bg-surface-container rounded text-[11px]"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => showToast("Test webhook payload dispatched.")}
                        className="py-1 px-3 border border-outline-variant/20 hover:bg-surface-container text-xs rounded text-on-surface flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Test Payload
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SUB-MODAL: Manual Setup Dialog
         ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {manualSetupFor && (
          <div
            className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
            onClick={() => {
              if (!isSubmittingManual) setManualSetupFor(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface-container-lowest p-6 rounded-lg shadow-2xl border border-outline-variant/20 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                      manualSetupFor.iconBg
                    )}
                  >
                    <manualSetupFor.icon className={cn("h-4 w-4", manualSetupFor.iconColor)} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-on-surface leading-tight">
                      Connect {manualSetupFor.name} manually
                    </h3>
                    <p className="text-[11px] text-on-surface-variant">Manual Configuration</p>
                  </div>
                </div>
                <button
                  disabled={isSubmittingManual}
                  onClick={() => setManualSetupFor(null)}
                  className="p-1 rounded hover:bg-surface-container text-on-surface-variant disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {MANUAL_FIELDS[manualSetupFor.id].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-on-surface">
                      {field.label} <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={field.isSecret && !showSecrets[field.key] ? "password" : "text"}
                        value={manualFormValues[field.key] || ""}
                        onChange={(e) => {
                          setManualFormValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                          if (manualFormError) setManualFormError(null);
                        }}
                        placeholder={field.placeholder}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-md px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-secondary transition-all pr-9"
                        disabled={isSubmittingManual}
                      />
                      {field.isSecret && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecrets((prev) => ({
                              ...prev,
                              [field.key]: !prev[field.key],
                            }))
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant hover:text-on-surface"
                        >
                          {showSecrets[field.key] ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {manualFormError && (
                  <p className="text-[11px] text-error font-medium">{manualFormError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmittingManual}
                  onClick={() => setManualSetupFor(null)}
                  className="py-2 px-3.5 border border-outline-variant/20 rounded text-xs text-on-surface hover:bg-surface-container font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingManual}
                  onClick={handleManualSubmit}
                  className="py-2 px-4 bg-secondary text-on-secondary rounded text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmittingManual ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
