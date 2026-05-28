import { TelemetryCard } from "@/src/components/TelemetryCard";
import type {
  GpsStatus,
  SyncStatus,
  TelemetryData,
  VehicleStatus
} from "@/src/types/telemetry";

type TelemetryPanelProps = {
  telemetry: TelemetryData | null;
};

const gpsLabels: Record<GpsStatus, string> = {
  ok: "OK",
  sem_sinal: "Sem sinal",
  indisponivel: "Indisponivel"
};

const vehicleLabels: Record<VehicleStatus, string> = {
  ligado: "Ligado",
  desligado: "Desligado",
  erro: "Erro"
};

const syncLabels: Record<SyncStatus, string> = {
  sincronizado: "Sincronizado",
  pendente: "Pendente",
  offline: "Offline"
};

function formatCoordinate(value: number | null) {
  return value === null ? "--" : value.toFixed(6);
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "Sem leitura";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
  }).format(new Date(value));
}

function getGpsTone(status?: GpsStatus) {
  if (status === "ok") {
    return "success";
  }

  if (status === "sem_sinal") {
    return "warning";
  }

  return "neutral";
}

function getVehicleTone(status?: VehicleStatus) {
  if (status === "ligado") {
    return "success";
  }

  if (status === "erro") {
    return "danger";
  }

  return "neutral";
}

function getSyncTone(status?: SyncStatus) {
  if (status === "sincronizado") {
    return "success";
  }

  if (status === "pendente") {
    return "warning";
  }

  return "danger";
}

export function TelemetryPanel({ telemetry }: TelemetryPanelProps) {
  const gpsDescription = telemetry
    ? `Lat ${formatCoordinate(telemetry.latitude)} | Lon ${formatCoordinate(telemetry.longitude)}`
    : "Lat -- | Lon --";

  return (
    <section aria-labelledby="telemetry-heading">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="telemetry-heading" className="text-lg font-semibold text-slate-950">
            Telemetria atual
          </h2>
          <p className="text-sm text-slate-600">
            Ultima leitura: {formatTimestamp(telemetry?.timestamp)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TelemetryCard
          title="Velocidade"
          value={telemetry ? String(telemetry.speed) : "--"}
          unit="km/h"
          description="Velocidade atual informada pelo sistema."
          tone="info"
        />
        <TelemetryCard
          title="RPM"
          value={telemetry ? String(telemetry.rpm) : "--"}
          unit="rpm"
          description="Rotacao atual do motor."
          tone="neutral"
        />
        <TelemetryCard
          title="GPS"
          value={telemetry ? gpsLabels[telemetry.gpsStatus] : "--"}
          description={gpsDescription}
          tone={getGpsTone(telemetry?.gpsStatus)}
        />
        <TelemetryCard
          title="Estado do veiculo"
          value={telemetry ? vehicleLabels[telemetry.vehicleStatus] : "--"}
          description="Estado operacional inferido pela ultima telemetria."
          tone={getVehicleTone(telemetry?.vehicleStatus)}
        />
        <TelemetryCard
          title="Registros no backend"
          value={telemetry ? String(telemetry.storedRecords) : "--"}
          description="Leituras armazenadas no PostgreSQL."
          tone="neutral"
        />
        <TelemetryCard
          title="Sincronizacao"
          value={telemetry ? syncLabels[telemetry.syncStatus] : "--"}
          description="Situacao dos dados em relacao ao envio."
          tone={getSyncTone(telemetry?.syncStatus)}
        />
      </div>
    </section>
  );
}
