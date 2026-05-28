import type {
  DeviceCommand,
  DeviceStatus,
  LogEntry,
  SyncStatus,
  TelemetryData
} from "@/src/types/telemetry";

export const DEFAULT_BASE_URL = "http://localhost:3000";

const BASE_URL_STORAGE_KEY = "telemetria_backend_base_url";
const TOKEN_STORAGE_KEY = "telemetria_backend_token";
const REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_EMAIL = process.env.NEXT_PUBLIC_TCC_EMAIL ?? "aluno@tcc.com";
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_TCC_PASSWORD ?? "123456";

type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  ok: false;
  message: string;
};

type LoginResponse = {
  accessToken: string;
};

type DispositivoApi = {
  id: string;
  veiculoId: string;
  codigoDispositivo: string;
  statusSincronizacao: "SINCRONIZADO" | "NAO_SINCRONIZADO";
  ultimaSincronizacao: string | null;
};

type VeiculoApi = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  dispositivo?: DispositivoApi | null;
};

type RegistroTelemetriaApi = {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  velocidadeObd: number | null;
  velocidadeGps: number | null;
  rpm: number | null;
};

type EventoApi = {
  tipo: string;
  descricao: string;
  severidade: "BAIXA" | "MEDIA" | "ALTA";
  timestamp: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

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

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function saveToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
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
      message: "Informe a URL base do backend antes de conectar."
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `O backend respondeu com erro HTTP ${response.status}.`
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
        message: "Tempo limite ao conectar com o backend. Verifique se a API NestJS esta rodando."
      };
    }

    if (error instanceof SyntaxError) {
      return {
        ok: false,
        message: "O backend respondeu, mas o JSON retornado nao pode ser lido."
      };
    }

    return {
      ok: false,
      message: "Nao foi possivel conectar ao backend. Confira a URL e o CORS da API."
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function authenticatedRequest<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit
) {
  const tokenResult = await getBackendToken(baseUrl);

  if (!tokenResult.ok) {
    return tokenResult;
  }

  return requestJson<T>(baseUrl, path, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokenResult.data}`,
      ...(options?.headers ?? {})
    }
  });
}

async function getBackendToken(baseUrl: string): Promise<ApiResult<string>> {
  const storedToken = getStoredToken();

  if (storedToken) {
    return { ok: true, data: storedToken };
  }

  const loginResult = await requestJson<LoginResponse>(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: DEFAULT_EMAIL,
      senha: DEFAULT_PASSWORD
    })
  });

  if (!loginResult.ok) {
    return {
      ok: false,
      message: `${loginResult.message} Execute o seed ou informe credenciais validas em NEXT_PUBLIC_TCC_EMAIL/NEXT_PUBLIC_TCC_PASSWORD.`
    };
  }

  saveToken(loginResult.data.accessToken);
  return { ok: true, data: loginResult.data.accessToken };
}

function syncStatusFromApi(status?: DispositivoApi["statusSincronizacao"]): SyncStatus {
  if (status === "SINCRONIZADO") {
    return "sincronizado";
  }

  if (status === "NAO_SINCRONIZADO") {
    return "offline";
  }

  return "pendente";
}

function getSpeed(registro: RegistroTelemetriaApi | undefined) {
  if (!registro) {
    return 0;
  }

  return Math.max(registro.velocidadeObd ?? 0, registro.velocidadeGps ?? 0);
}

async function fetchVeiculos(baseUrl: string) {
  return authenticatedRequest<VeiculoApi[]>(baseUrl, "/veiculos");
}

async function fetchDispositivos(baseUrl: string) {
  return authenticatedRequest<DispositivoApi[]>(baseUrl, "/dispositivos");
}

export async function fetchStatus(baseUrl: string): Promise<ApiResult<DeviceStatus>> {
  const dispositivosResult = await fetchDispositivos(baseUrl);

  if (!dispositivosResult.ok) {
    return dispositivosResult;
  }

  const dispositivo = dispositivosResult.data[0];

  return {
    ok: true,
    data: {
      connected: dispositivo?.statusSincronizacao === "SINCRONIZADO",
      deviceName: dispositivo?.codigoDispositivo ?? "Nenhum dispositivo cadastrado",
      firmwareVersion: "Backend NestJS",
      uptime: 0
    }
  };
}

export async function fetchTelemetry(baseUrl: string): Promise<ApiResult<TelemetryData>> {
  const veiculosResult = await fetchVeiculos(baseUrl);

  if (!veiculosResult.ok) {
    return veiculosResult;
  }

  const veiculo = veiculosResult.data[0];

  if (!veiculo) {
    return {
      ok: false,
      message: "Nenhum veiculo encontrado para o usuario autenticado."
    };
  }

  const registrosResult = await authenticatedRequest<RegistroTelemetriaApi[]>(
    baseUrl,
    `/telemetria/veiculo/${veiculo.id}`
  );

  if (!registrosResult.ok) {
    return registrosResult;
  }

  const registro = registrosResult.data[0];
  const speed = getSpeed(registro);

  return {
    ok: true,
    data: {
      speed,
      rpm: registro?.rpm ?? 0,
      latitude: registro?.latitude ?? null,
      longitude: registro?.longitude ?? null,
      gpsStatus: registro ? "ok" : "indisponivel",
      vehicleStatus: speed > 0 || (registro?.rpm ?? 0) > 0 ? "ligado" : "desligado",
      storedRecords: registrosResult.data.length,
      syncStatus: syncStatusFromApi(veiculo.dispositivo?.statusSincronizacao),
      timestamp: registro?.timestamp ?? new Date().toISOString()
    }
  };
}

export async function fetchLogs(baseUrl: string): Promise<ApiResult<LogEntry[]>> {
  const veiculosResult = await fetchVeiculos(baseUrl);

  if (!veiculosResult.ok) {
    return veiculosResult;
  }

  const veiculo = veiculosResult.data[0];

  if (!veiculo) {
    return { ok: true, data: [] };
  }

  const eventosResult = await authenticatedRequest<EventoApi[]>(
    baseUrl,
    `/eventos/veiculo/${veiculo.id}`
  );

  if (!eventosResult.ok) {
    return eventosResult;
  }

  return {
    ok: true,
    data: eventosResult.data.map((evento) => ({
      level: evento.severidade === "ALTA" ? "error" : evento.severidade === "MEDIA" ? "warning" : "info",
      message: `${evento.tipo}: ${evento.descricao}`,
      timestamp: evento.timestamp
    }))
  };
}

export async function sendCommand(baseUrl: string, command: DeviceCommand) {
  if (command === "sync") {
    return authenticatedRequest<{ message?: string }>(
      baseUrl,
      "/dispositivos/verificar-sincronizacao",
      { method: "PATCH" }
    );
  }

  const messages: Record<DeviceCommand, string> = {
    start: "Monitoramento controlado pelo dispositivo embarcado.",
    stop: "Parada do monitoramento deve ser enviada ao firmware.",
    sync: "Sincronizacao verificada no backend.",
    "clear-logs": "Limpeza local de logs mantida apenas na interface."
  };

  return {
    ok: true,
    data: { message: messages[command] }
  } satisfies ApiResult<{ message?: string }>;
}
