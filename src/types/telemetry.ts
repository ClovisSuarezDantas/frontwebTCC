export type GpsStatus = "ok" | "sem_sinal" | "indisponivel";

export type VehicleStatus = "ligado" | "desligado" | "erro";

export type SyncStatus = "sincronizado" | "pendente" | "offline";

export type TelemetryData = {
  speed: number;
  rpm: number;
  latitude: number | null;
  longitude: number | null;
  gpsStatus: GpsStatus;
  vehicleStatus: VehicleStatus;
  storedRecords: number;
  syncStatus: SyncStatus;
  timestamp: string;
};

export type DeviceStatus = {
  connected: boolean;
  deviceName: string;
  firmwareVersion: string;
  uptime: number;
};

export type LogEntry = {
  level: "info" | "warning" | "error";
  message: string;
  timestamp: string;
};

export type AppMode = "mock" | "real";

export type DeviceCommand = "start" | "stop" | "sync" | "clear-logs";
