"use client";

import { Settings, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";

export function SettingsToggle() {
  const { errorSimulationEnabled, setErrorSimulationEnabled } = useSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-destructive" />
              <span className="text-sm">Error Simulation</span>
            </div>
            <Switch
              checked={errorSimulationEnabled}
              onCheckedChange={setErrorSimulationEnabled}
            />
          </div>
        </DropdownMenuItem>
        {errorSimulationEnabled && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            15% of AI requests will fail
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
