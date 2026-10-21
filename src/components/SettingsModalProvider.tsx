"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import SettingsModal, { SettingsTab } from "./SettingsModal";

interface SettingsModalContextType {
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
  isOpen: boolean;
  activeTab: SettingsTab;
}

const SettingsModalContext = createContext<SettingsModalContextType | undefined>(undefined);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("organization");

  const openSettings = useCallback((tab?: SettingsTab) => {
    if (tab) {
      setActiveTab(tab);
    }
    setIsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SettingsModalContext.Provider
      value={{
        openSettings,
        closeSettings,
        isOpen,
        activeTab,
      }}
    >
      {children}
      <SettingsModal
        isOpen={isOpen}
        initialTab={activeTab}
        onClose={closeSettings}
      />
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const context = useContext(SettingsModalContext);
  if (!context) {
    throw new Error("useSettingsModal must be used within a SettingsModalProvider");
  }
  return context;
}
