import type {
  DeviceCommand,
  DeviceStatus,
  LogEntry,
  TelemetryData
} from "@/src/types/telemetry";

const mockLogs: LogEntry[] = [
  {
    level: "info",
    message: "Modo mock iniciado.",
    timestamp: new Date().toISOString()
  }
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function appendMockLog(log: Omit<LogEntry, "timestamp">) {
  mockLogs.unshift({
    ...log,
    timestamp: new Date().toISOString()
  });

  if (mockLogs.length > 30) {
    mockLogs.pop();
  }
}

export function getMockStatus(): DeviceStatus {
  return {
    connected: true,
    deviceName: "ESP32 Telemetria Mock",
    firmwareVersion: "0.1.0-mock",
    uptime: Math.floor(performance.now() / 1000)
  };
}

export function getMockTelemetry(previous?: TelemetryData): TelemetryData {
  const baseSpeed = previous?.speed ?? randomBetween(28, 56);
  const speed = Math.round(clamp(baseSpeed + randomBetween(-6, 7), 0, 120));
  const rpm = Math.round(clamp(900 + speed * 34 + randomBetween(-150, 220), 700, 5200));
  const hasGpsSignal = Math.random() > 0.12;
  const pendingRecords = previous?.storedRecords ?? 128;

  if (Math.random() > 0.72) {
    appendMockLog({
      level: "info",
      message: "Leitura simulada de OBD-II e GPS atualizada."
    });
  }

  return {
    speed,
    rpm,
    latitude: hasGpsSignal ? Number((-12.9777 + randomBetween(-0.01, 0.01)).toFixed(6)) : null,
    longitude: hasGpsSignal ? Number((-38.5016 + randomBetween(-0.01, 0.01)).toFixed(6)) : null,
    gpsStatus: hasGpsSignal ? "ok" : "sem_sinal",
    vehicleStatus: speed > 0 || rpm > 800 ? "ligado" : "desligado",
    storedRecords: Math.max(0, pendingRecords + Math.round(randomBetween(-2, 5))),
    syncStatus: Math.random() > 0.25 ? "pendente" : "sincronizado",
    timestamp: new Date().toISOString()
  };
}

export function getMockLogs() {
  return [...mockLogs];
}

export function runMockCommand(command: DeviceCommand) {
  const messages: Record<DeviceCommand, string> = {
    start: "Monitoramento iniciado no modo mock.",
    stop: "Monitoramento parado no modo mock.",
    sync: "Sincronização simulada concluída.",
    "clear-logs": "Logs simulados limpos."
  };

  if (command === "clear-logs") {
    mockLogs.splice(0, mockLogs.length);
  }

  appendMockLog({
    level: "info",
    message: messages[command]
  });

  return {
    ok: true as const,
    message: messages[command],
    logs: getMockLogs()
  };
}
