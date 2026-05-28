"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_BASE_URL,
  fetchLogs,
  fetchStatus,
  fetchTelemetry,
  getStoredBaseUrl,
  saveBaseUrl,
  sendCommand
} from "@/src/lib/api";
import {
  getMockLogs,
  getMockStatus,
  getMockTelemetry,
  runMockCommand
} from "@/src/lib/mock";
import type {
  AppMode,
  DeviceCommand,
  DeviceStatus,
  LogEntry,
  TelemetryData
} from "@/src/types/telemetry";

const offlineStatus: DeviceStatus = {
  connected: false,
  deviceName: "Backend indisponivel",
  firmwareVersion: "-",
  uptime: 0
};

const initialMockStatus: DeviceStatus = {
  connected: true,
  deviceName: "ESP32 Telemetria Mock",
  firmwareVersion: "0.1.0-mock",
  uptime: 0
};

function createLocalLog(level: LogEntry["level"], message: string): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString()
  };
}

export function useTelemetry() {
  const [mode, setMode] = useState<AppMode>("mock");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [status, setStatus] = useState<DeviceStatus>(initialMockStatus);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommandRunning, setIsCommandRunning] = useState(false);

  useEffect(() => {
    setBaseUrl(getStoredBaseUrl());
  }, []);

  const updateBaseUrl = useCallback((value: string) => {
    setBaseUrl(value);
    saveBaseUrl(value);
  }, []);

  const refresh = useCallback(async () => {
    if (mode === "mock") {
      setStatus(getMockStatus());
      setTelemetry((current) => getMockTelemetry(current ?? undefined));
      setLogs(getMockLogs());
      setError(null);
      setLastUpdated(new Date().toISOString());
      return;
    }

    setIsLoading(true);

    const [statusResult, telemetryResult, logsResult] = await Promise.all([
      fetchStatus(baseUrl),
      fetchTelemetry(baseUrl),
      fetchLogs(baseUrl)
    ]);

    const messages: string[] = [];

    if (statusResult.ok) {
      setStatus(statusResult.data);
    } else {
      setStatus(offlineStatus);
      messages.push(statusResult.message);
    }

    if (telemetryResult.ok) {
      setTelemetry(telemetryResult.data);
    } else {
      messages.push(telemetryResult.message);
    }

    if (logsResult.ok) {
      setLogs(logsResult.data);
    } else {
      messages.push(logsResult.message);
      setLogs((current) => [
        createLocalLog("error", logsResult.message),
        ...current
      ].slice(0, 30));
    }

    setError(messages[0] ?? null);
    setLastUpdated(new Date().toISOString());
    setIsLoading(false);
  }, [baseUrl, mode]);

  const testConnection = useCallback(async () => {
    if (mode === "mock") {
      setStatus(getMockStatus());
      setError(null);
      setLogs((current) => [
        createLocalLog("info", "Teste de conexao mock aprovado."),
        ...current
      ].slice(0, 30));
      return;
    }

    setIsLoading(true);
    const result = await fetchStatus(baseUrl);

    if (result.ok) {
      setStatus(result.data);
      setError(null);
      setLogs((current) => [
        createLocalLog("info", "Conexao com backend testada com sucesso."),
        ...current
      ].slice(0, 30));
    } else {
      setStatus(offlineStatus);
      setError(result.message);
      setLogs((current) => [
        createLocalLog("error", result.message),
        ...current
      ].slice(0, 30));
    }

    setLastUpdated(new Date().toISOString());
    setIsLoading(false);
  }, [baseUrl, mode]);

  const runCommand = useCallback(
    async (command: DeviceCommand) => {
      setIsCommandRunning(true);

      if (mode === "mock") {
        const result = runMockCommand(command);
        setLogs(result.logs);
        setError(null);
        setIsCommandRunning(false);
        return;
      }

      const result = await sendCommand(baseUrl, command);

      if (result.ok) {
        setError(null);
        setLogs((current) => [
          createLocalLog("info", result.data?.message || "Comando executado no backend."),
          ...current
        ].slice(0, 30));
        await refresh();
      } else {
        setError(result.message);
        setLogs((current) => [
          createLocalLog("error", result.message),
          ...current
        ].slice(0, 30));
      }

      setIsCommandRunning(false);
    },
    [baseUrl, mode, refresh]
  );

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 2000);

    return () => window.clearInterval(interval);
  }, [refresh]);

  return {
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
  };
}
