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
  const [errorSimulationEnabled, setErrorSimulationEnabled] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("errorSimulationEnabled");
    if (saved !== null) {
      setErrorSimulationEnabled(JSON.parse(saved));
    }
  }, []);

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
