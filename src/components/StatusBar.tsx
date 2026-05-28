import type { AppMode, DeviceStatus } from "@/src/types/telemetry";

type StatusBarProps = {
  mode: AppMode;
  status: DeviceStatus;
  error: string | null;
  lastUpdated: string | null;
  isLoading: boolean;
};

function formatUptime(seconds: number) {
  if (!seconds) {
    return "0s";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  if (minutes > 0) {
    return `${minutes}min ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function formatLastUpdated(value: string | null) {
  if (!value) {
    return "Ainda nao atualizado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "medium"
  }).format(new Date(value));
}

export function StatusBar({
  mode,
  status,
  error,
  lastUpdated,
  isLoading
}: StatusBarProps) {
  const connectedClasses = status.connected
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${connectedClasses}`}>
              {status.connected ? "Conectado" : "Desconectado"}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
              {mode === "mock" ? "Modo Mock" : "Backend NestJS"}
            </span>
            {isLoading ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                Atualizando
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{status.deviceName}</h2>
          <p className="text-sm text-slate-600">
            Origem {status.firmwareVersion} | Uptime {formatUptime(status.uptime)}
          </p>
        </div>

        <div className="text-sm text-slate-600 lg:text-right">
          <div>Ultima atualizacao</div>
          <div className="font-semibold text-slate-900">{formatLastUpdated(lastUpdated)}</div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
    </section>
  );
}
