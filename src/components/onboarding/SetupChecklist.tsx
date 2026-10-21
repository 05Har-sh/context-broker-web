"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Flag,
  Cable,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SetupChecklistProps {
  hasIntegration: boolean;
  hasIntegrationVerified: boolean;
  hasEvents: boolean;
  hasViewedIntelligence: boolean;
  onConnectClick: () => void;
  onViewStatusClick: () => void;
  onExploreDashboardClick: () => void;
}

export default function SetupChecklist({
  hasIntegration,
  hasIntegrationVerified,
  hasEvents,
  hasViewedIntelligence,
  onConnectClick,
  onViewStatusClick,
  onExploreDashboardClick,
}: SetupChecklistProps) {
  const steps = [
    {
      id: "connect",
      stepNumber: 1,
      title: "Connect Slack or Jira",
      isComplete: hasIntegration,
      tagline: "Link your team tools to begin streaming alerts & operational data",
      description:
        "Connect Slack to monitor channels and threads, or connect Jira to correlate issue updates and tracking tickets in real-time.",
      actionLabel: hasIntegration ? "Manage Integrations" : "+ Connect Integration",
      action: onConnectClick,
      icon: Cable,
      estimatedTime: "1 min",
    },
    {
      id: "verify",
      stepNumber: 2,
      title: "Verify the integration",
      isComplete: hasIntegrationVerified,
      tagline: "Confirm webhook connectivity and active sync status",
      description:
        "Ensure your integration handshake succeeded, authorization tokens are valid, and the webhook endpoint is ready to receive events.",
      actionLabel: "View Integration Status",
      action: onViewStatusClick,
      icon: ShieldCheck,
      estimatedTime: "30 sec",
    },
    {
      id: "event",
      stepNumber: 3,
      title: "Receive the first incident event",
      isComplete: hasEvents,
      tagline: "Capture your first live alert, incident notification, or ticket",
      description:
        "Trigger or simulate an alert in Slack or create a Jira issue. Context Broker's ingestion pipeline will automatically parse the payload and calculate risk.",
      actionLabel: hasEvents ? "View Event Log" : "Awaiting Incoming Event",
      action: onViewStatusClick,
      icon: Zap,
      estimatedTime: "1 min",
    },
    {
      id: "intelligence",
      stepNumber: 4,
      title: "View incident intelligence on the dashboard",
      isComplete: hasViewedIntelligence,
      tagline: "Explore risk telemetry, blast radius, and root cause analysis",
      description:
        "Review AI-driven risk scoring, incident progression timelines, severity breakdown, and prioritized operational queues.",
      actionLabel: "Explore Dashboard Intelligence",
      action: onExploreDashboardClick,
      icon: Activity,
      estimatedTime: "30 sec",
    },
  ];

  // Compute completed count
  const completedCount = steps.filter((s) => s.isComplete).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Automatically select the first incomplete step, or step 1
  const firstIncompleteIndex = steps.findIndex((s) => !s.isComplete);
  const defaultStepIndex = firstIncompleteIndex === -1 ? 0 : firstIncompleteIndex;

  const [selectedStepIndex, setSelectedStepIndex] = useState(defaultStepIndex);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentStep = steps[selectedStepIndex];

  return (
    <div className="bg-surface-container-lowest ghost-border rounded-xl p-6 mb-8 shadow-sm">
      {/* Header with Title and Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-outline-variant/15 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-on-surface">Setup checklist</h2>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
              title={isCollapsed ? "Expand checklist" : "Collapse checklist"}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Step {selectedStepIndex + 1} of {steps.length}. Estimated 3 minutes to complete
          </p>
        </div>

        {/* Top-Right Progress Bar (matching Image 2) */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
            {completedCount} of {steps.length} steps
          </span>
          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-bold text-on-surface whitespace-nowrap">
            {progressPercent}% done
          </span>
        </div>
      </div>

      {/* Main Checklist Body */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
              {/* Left Column: Step List */}
              <div className="lg:col-span-6 space-y-2.5">
                {steps.map((step, idx) => {
                  const isSelected = selectedStepIndex === idx;
                  const isComplete = step.isComplete;

                  return (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStepIndex(idx)}
                      className={`group flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-secondary/5 border-secondary/40 shadow-sm"
                          : "bg-surface-container-low/40 border-outline-variant/10 hover:bg-surface-container-low hover:border-outline-variant/25"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox / Completion Icon */}
                        {isComplete ? (
                          <div className="w-5 h-5 rounded flex items-center justify-center bg-secondary/15 text-secondary shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-secondary" />
                          </div>
                        ) : (
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-secondary text-secondary"
                                : "border-outline-variant/40 text-on-surface-variant/40"
                            }`}
                          >
                            <Circle className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}

                        <span
                          className={`text-sm font-semibold transition-colors ${
                            isComplete
                              ? "text-on-surface-variant line-through decoration-on-surface-variant/40"
                              : isSelected
                              ? "text-on-surface"
                              : "text-on-surface-variant group-hover:text-on-surface"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary/15 text-secondary">
                            CURRENT STEP
                          </span>
                        )}
                        <span className="text-xs text-on-surface-variant/60 font-mono">
                          Step {step.stepNumber}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Selected Step Details Card (matching Image 2) */}
              <div className="lg:col-span-6 flex flex-col justify-between p-6 rounded-xl bg-surface-container-low border border-outline-variant/15">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flag
                      className={`w-3.5 h-3.5 ${
                        currentStep.isComplete ? "text-secondary" : "text-amber-500"
                      }`}
                    />
                    <span className="text-[11px] font-bold tracking-wider uppercase text-on-surface-variant">
                      {currentStep.isComplete ? "COMPLETED" : "CURRENT STEP"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-on-surface mb-2">
                    {currentStep.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                    {currentStep.description}
                  </p>

                  {/* Visual Preview / Step Icon Illustration */}
                  <div className="rounded-lg bg-surface-container-lowest/80 border border-outline-variant/10 p-6 flex flex-col items-center justify-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3 shadow-inner">
                      <currentStep.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-on-surface">
                      {currentStep.tagline}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      Estimated duration: {currentStep.estimatedTime}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                  <Button
                    onClick={currentStep.action}
                    className="bg-secondary text-on-secondary hover:bg-secondary/90 font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    {currentStep.actionLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>

                  <a
                    href="https://docs.contextbroker.io"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-medium transition-colors"
                  >
                    Learn more
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
