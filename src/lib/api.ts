import type {
  DeviceCommand,
  DeviceStatus,
  LogEntry,
  TelemetryData
} from "@/src/types/telemetry";

export const DEFAULT_BASE_URL = "http://192.168.4.1";

const BASE_URL_STORAGE_KEY = "telemetria_esp32_base_url";
const REQUEST_TIMEOUT_MS = 5000;

type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  ok: false;
  message: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

const commandPaths: Record<DeviceCommand, string> = {
  start: "/command/start",
  stop: "/command/stop",
  sync: "/command/sync",
  "clear-logs": "/command/clear-logs"
};

export function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export function getStoredBaseUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_BASE_URL;
  }

  return localStorage.getItem(BASE_URL_STORAGE_KEY) || DEFAULT_BASE_URL;
}

export function saveBaseUrl(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(BASE_URL_STORAGE_KEY, normalizeBaseUrl(url));
}

async function requestJson<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (!normalizedBaseUrl) {
    return {
      ok: false,
      message: "Informe a URL base do ESP32 antes de conectar."
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `O ESP32 respondeu com erro HTTP ${response.status}.`
      };
    }

    if (response.status === 204) {
      return { ok: true, data: undefined as T };
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : (undefined as T);

    return { ok: true, data };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        ok: false,
        message: "Tempo limite ao conectar com o ESP32. Verifique a rede e tente novamente."
      };
    }

    if (error instanceof SyntaxError) {
      return {
        ok: false,
        message: "O ESP32 respondeu, mas o JSON retornado não pôde ser lido."
      };
    }

    return {
      ok: false,
      message: "Não foi possível conectar ao ESP32. Confira a URL, o Wi-Fi e o CORS do firmware."
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function fetchStatus(baseUrl: string) {
  return requestJson<DeviceStatus>(baseUrl, "/status");
}

export function fetchTelemetry(baseUrl: string) {
  return requestJson<TelemetryData>(baseUrl, "/telemetry");
}

export function fetchLogs(baseUrl: string) {
  return requestJson<LogEntry[]>(baseUrl, "/logs");
}

export function sendCommand(baseUrl: string, command: DeviceCommand) {
  return requestJson<{ message?: string }>(baseUrl, commandPaths[command], {
    method: "POST"
  });
}
