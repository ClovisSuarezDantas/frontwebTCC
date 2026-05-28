import type { DeviceCommand } from "@/src/types/telemetry";

type CommandPanelProps = {
  isBusy: boolean;
  isLoading: boolean;
  onCommand: (command: DeviceCommand) => void;
  onRefresh: () => void;
};

const commandButtons: Array<{
  label: string;
  command: DeviceCommand;
  className: string;
}> = [
  {
    label: "Iniciar monitoramento",
    command: "start",
    className: "bg-emerald-600 hover:bg-emerald-700"
  },
  {
    label: "Parar monitoramento",
    command: "stop",
    className: "bg-rose-600 hover:bg-rose-700"
  },
  {
    label: "Verificar sincronizacao",
    command: "sync",
    className: "bg-sky-600 hover:bg-sky-700"
  },
  {
    label: "Limpar logs",
    command: "clear-logs",
    className: "bg-slate-700 hover:bg-slate-800"
  }
];

export function CommandPanel({
  isBusy,
  isLoading,
  onCommand,
  onRefresh
}: CommandPanelProps) {
  const disabled = isBusy || isLoading;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Comandos</h2>
          <p className="text-sm text-slate-600">Acoes basicas integradas ao backend e firmware.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {commandButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            onClick={() => onCommand(button.command)}
            disabled={disabled}
            className={`min-h-11 rounded-md px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${button.className}`}
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onRefresh}
          disabled={disabled}
          className="min-h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          Atualizar agora
        </button>
      </div>
    </section>
  );
}
