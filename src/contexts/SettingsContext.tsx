"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SettingsContextType {
  errorSimulationEnabled: boolean;
  setErrorSimulationEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize state directly from localStorage to avoid timing issues
  const [errorSimulationEnabled, setErrorSimulationEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("errorSimulationEnabled");
      if (saved !== null) {
        return JSON.parse(saved);
      }
    }
    return false;
  });

  // Save to localStorage when changed
  const handleSetErrorSimulation = (enabled: boolean) => {
    setErrorSimulationEnabled(enabled);
    localStorage.setItem("errorSimulationEnabled", JSON.stringify(enabled));
  };

  return (
    <SettingsContext.Provider
      value={{
        errorSimulationEnabled,
        setErrorSimulationEnabled: handleSetErrorSimulation,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
