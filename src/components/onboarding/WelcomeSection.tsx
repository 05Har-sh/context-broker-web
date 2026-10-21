"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cable, Users, HelpCircle, BookOpen, MessageSquare, Sparkles } from "lucide-react";

interface WelcomeSectionProps {
  userName?: string;
  onConnectClick: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function WelcomeSection({
  userName,
  onConnectClick,
  onDismiss,
  showDismiss = false,
}: WelcomeSectionProps) {
  const displayName = userName ? `, ${userName}` : "";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest to-surface-container-low/40 border border-outline-variant/15 p-8 sm:p-12 mb-8 text-center shadow-sm">
      {/* Botanical Flower Illustration matching user reference */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-36 flex items-end justify-center">
          <svg
            viewBox="0 0 200 160"
            className="w-full h-full stroke-on-surface/40 fill-none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Ground line */}
            <line x1="40" y1="140" x2="160" y2="140" strokeDasharray="3 3" />
            <line x1="75" y1="140" x2="125" y2="140" />

            {/* Left small sprout */}
            <path d="M 68 140 C 68 120, 62 110, 65 98" />
            <path
              d="M 65 98 C 60 90, 68 85, 72 92 C 74 97, 70 102, 65 98 Z"
              className="fill-surface-variant/40"
            />

            {/* Middle growing tulip bud */}
            <path d="M 100 140 C 100 105, 96 85, 97 65" />
            {/* Middle leaf */}
            <path d="M 98 108 C 88 104, 85 96, 92 92 C 96 95, 97 100, 98 108 Z" />
            {/* Middle tulip bud */}
            <path
              d="M 92 65 C 88 52, 94 45, 98 42 C 102 45, 108 52, 104 65 C 100 68, 96 68, 92 65 Z"
              className="fill-surface-variant/30"
            />
            <path d="M 98 42 L 98 55" />

            {/* Tall right blooming flower stem */}
            <path d="M 132 140 C 130 95, 136 60, 134 32" />
            {/* Stem leaf right */}
            <path d="M 134 78 C 146 72, 150 64, 142 60 C 136 64, 134 70, 134 78 Z" />
            {/* Stem leaf left */}
            <path d="M 133 98 C 122 94, 120 86, 128 82 C 132 86, 133 90, 133 98 Z" />

            {/* Flower Petals (Blooming Purple/Lavender Gradient) */}
            <defs>
              <linearGradient id="flowerPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C4B5FD" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#4C1D95" />
              </linearGradient>
            </defs>

            <g transform="translate(134, 25)">
              {/* Petal 1 - Top Left */}
              <path
                d="M 0 0 C -12 -6, -14 -18, -4 -20 C 4 -16, 2 -6, 0 0 Z"
                fill="url(#flowerPetalGrad)"
                stroke="#6D28D9"
                strokeWidth="1"
              />
              {/* Petal 2 - Top Right */}
              <path
                d="M 0 0 C 4 -16, 16 -16, 18 -6 C 14 2, 4 0, 0 0 Z"
                fill="url(#flowerPetalGrad)"
                stroke="#6D28D9"
                strokeWidth="1"
              />
              {/* Petal 3 - Right */}
              <path
                d="M 0 0 C 6 4, 18 10, 14 20 C 6 18, 2 8, 0 0 Z"
                fill="url(#flowerPetalGrad)"
                stroke="#6D28D9"
                strokeWidth="1"
              />
              {/* Petal 4 - Bottom */}
              <path
                d="M 0 0 C -4 8, -6 18, -14 14 C -16 6, -6 2, 0 0 Z"
                fill="url(#flowerPetalGrad)"
                stroke="#6D28D9"
                strokeWidth="1"
              />
              {/* Petal 5 - Left */}
              <path
                d="M 0 0 C -12 -2, -18 4, -14 12 C -8 12, -2 4, 0 0 Z"
                fill="url(#flowerPetalGrad)"
                stroke="#6D28D9"
                strokeWidth="1"
              />
              {/* Flower Center Core */}
              <circle cx="0" cy="0" r="4.5" fill="#DDD6FE" stroke="#5B21B6" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-3 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Welcome to Context Broker{displayName}!
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Welcome to Context Broker. Connect your tools to bring incidents, updates, and operational risks into one place.
        </p>

        {/* Primary Action Button */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={onConnectClick}
            className="bg-primary text-on-primary hover:bg-primary/90 font-semibold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <Cable className="w-4 h-4" />
            Connect your first integration
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onConnectClick}
            className="border-outline-variant/30 text-on-surface hover:bg-surface-container-high rounded-lg font-medium px-5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-secondary mr-2" />
            Browse integrations
          </Button>
        </div>
      </div>

      {/* Need Help Getting Started? Footer Card (matching Image 1) */}
      <div className="max-w-2xl mx-auto pt-6 border-t border-outline-variant/15 text-xs text-on-surface-variant">
        <div className="font-semibold text-on-surface mb-1">Need help getting started?</div>
        <p className="mb-4 text-on-surface-variant/80">
          Invite a teammate to collaborate on setup or explore our guides to walk through the integration process.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <a
            href="/settings"
            className="p-2.5 rounded-md bg-surface-container-low/60 hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface group cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate font-medium">Invite teammate</span>
          </a>

          <a
            href="mailto:support@contextbroker.io"
            className="p-2.5 rounded-md bg-surface-container-low/60 hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface group cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate font-medium">Contact support</span>
          </a>

          <a
            href="https://docs.contextbroker.io"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-md bg-surface-container-low/60 hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface group cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate font-medium">Documentation</span>
          </a>

          <a
            href="https://help.contextbroker.io"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-md bg-surface-container-low/60 hover:bg-surface-container transition-colors flex items-center gap-2 text-on-surface group cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate font-medium">Help center</span>
          </a>
        </div>
      </div>
    </div>
  );
}
