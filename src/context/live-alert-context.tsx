"use client";

import * as React from "react";
import { toast } from "sonner";

interface LiveAlert {
  id: string;
  tail: string;
  message: string;
  timestamp: string;
}

interface LiveAlertContextValue {
  alerts: LiveAlert[];
  triggerDemoAlert: () => void;
}

const LiveAlertContext = React.createContext<LiveAlertContextValue | null>(null);

const SCRIPTED_ALERT = {
  tail: "AF-112",
  message: "Turbine Blade Stage 2 vibration crossed monitor threshold on AF-112",
};

export function LiveAlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = React.useState<LiveAlert[]>([]);
  const fired = React.useRef(false);

  const fire = React.useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    const alert: LiveAlert = {
      id: `alert-${Date.now()}`,
      tail: SCRIPTED_ALERT.tail,
      message: SCRIPTED_ALERT.message,
      timestamp: new Date().toISOString(),
    };
    setAlerts((prev) => [alert, ...prev]);
    toast.warning("New anomaly detected", {
      description: alert.message,
      duration: 6000,
    });
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(fire, 20000);
    return () => clearTimeout(timer);
  }, [fire]);

  return (
    <LiveAlertContext.Provider value={{ alerts, triggerDemoAlert: fire }}>{children}</LiveAlertContext.Provider>
  );
}

export function useLiveAlerts() {
  const ctx = React.useContext(LiveAlertContext);
  if (!ctx) throw new Error("useLiveAlerts must be used within LiveAlertProvider");
  return ctx;
}
