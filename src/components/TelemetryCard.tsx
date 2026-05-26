type TelemetryCardProps = {
  title: string;
  value: string;
  unit?: string;
  description?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

const toneClasses: Record<NonNullable<TelemetryCardProps["tone"]>, string> = {
  neutral: "border-slate-200 bg-white",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  danger: "border-rose-200 bg-rose-50",
  info: "border-sky-200 bg-sky-50"
};

export function TelemetryCard({
  title,
  value,
  unit,
  description,
  tone = "neutral"
}: TelemetryCardProps) {
  return (
    <article className={`rounded-lg border p-4 shadow-sm ${toneClasses[tone]}`}>
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className="mt-3 flex min-h-10 items-baseline gap-2">
        <span className="break-words text-3xl font-semibold leading-none text-slate-950">
          {value}
        </span>
        {unit ? <span className="text-sm font-medium text-slate-500">{unit}</span> : null}
      </div>
      {description ? (
        <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{description}</p>
      ) : null}
    </article>
  );
}
