import type { LogEntry } from "@/src/types/telemetry";

type LogsPanelProps = {
  logs: LogEntry[];
};

const levelClasses: Record<LogEntry["level"], string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800"
};

function formatLogTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeStyle: "medium"
  }).format(new Date(value));
}

export function LogsPanel({ logs }: LogsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Logs recentes</h2>
          <p className="text-sm text-slate-600">{logs.length} registro(s) exibido(s)</p>
        </div>
      </div>

      <div className="max-h-80 overflow-auto rounded-md border border-slate-200">
        {logs.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500">Nenhum log recebido.</div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {logs.slice(0, 30).map((log, index) => (
              <li key={`${log.timestamp}-${index}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[96px_100px_minmax(0,1fr)] sm:items-start">
                <time className="text-sm font-medium text-slate-500">{formatLogTime(log.timestamp)}</time>
                <span className={`w-fit rounded-full border px-2 py-1 text-xs font-semibold uppercase ${levelClasses[log.level]}`}>
                  {log.level}
                </span>
                <p className="text-sm leading-5 text-slate-800">{log.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
