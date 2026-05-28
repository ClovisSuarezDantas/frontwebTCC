import type { AppMode } from "@/src/types/telemetry";

type ConfigPanelProps = {
  mode: AppMode;
  baseUrl: string;
  isLoading: boolean;
  onModeChange: (mode: AppMode) => void;
  onBaseUrlChange: (value: string) => void;
  onTestConnection: () => void;
};

export function ConfigPanel({
  mode,
  baseUrl,
  isLoading,
  onModeChange,
  onBaseUrlChange,
  onTestConnection
}: ConfigPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Modo de operacao</label>
          <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onModeChange("mock")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "mock"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Modo Mock
            </button>
            <button
              type="button"
              onClick={() => onModeChange("real")}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                mode === "real"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Backend NestJS
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="backend-url" className="mb-2 block text-sm font-medium text-slate-700">
            URL base da API
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="backend-url"
              type="url"
              value={baseUrl}
              onChange={(event) => onBaseUrlChange(event.target.value)}
              placeholder="http://localhost:3000"
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <button
              type="button"
              onClick={onTestConnection}
              disabled={isLoading}
              className="min-h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Testar conexao
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
