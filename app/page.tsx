"use client";

import { CommandPanel } from "@/src/components/CommandPanel";
import { ConfigPanel } from "@/src/components/ConfigPanel";
import { LogsPanel } from "@/src/components/LogsPanel";
import { StatusBar } from "@/src/components/StatusBar";
import { TelemetryPanel } from "@/src/components/TelemetryPanel";
import { useTelemetry } from "@/src/hooks/useTelemetry";

export default function Home() {
  const {
    mode,
    setMode,
    baseUrl,
    updateBaseUrl,
    status,
    telemetry,
    logs,
    error,
    lastUpdated,
    isLoading,
    isCommandRunning,
    refresh,
    testConnection,
    runCommand
  } = useTelemetry();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-col gap-2 border-b border-slate-200 pb-5">
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            MVP Telemetria Veicular
          </h1>
          <p className="text-base text-slate-600">Painel de teste para ESP32, OBD-II e GPS</p>
        </header>

        <ConfigPanel
          mode={mode}
          baseUrl={baseUrl}
          isLoading={isLoading}
          onModeChange={setMode}
          onBaseUrlChange={updateBaseUrl}
          onTestConnection={testConnection}
        />

        <StatusBar
          mode={mode}
          status={status}
          error={error}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />

        <TelemetryPanel telemetry={telemetry} />

        <CommandPanel
          isBusy={isCommandRunning}
          isLoading={isLoading}
          onCommand={runCommand}
          onRefresh={refresh}
        />

        <LogsPanel logs={logs} />
      </div>
    </main>
  );
}
