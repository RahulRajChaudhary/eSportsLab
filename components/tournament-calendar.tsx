type CalendarStage = {
  id: string;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
};

const STAGE_COLORS = ["bg-blue-600", "bg-cyan-600", "bg-indigo-600", "bg-sky-600", "bg-blue-800"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function inRange(day: Date, start: Date, end: Date) {
  const d = day.getTime();
  return (
    d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() &&
    d <= new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  );
}

function MonthGrid({
  month,
  stages,
  colorByStage,
}: {
  month: Date;
  stages: (CalendarStage & { startDate: Date; endDate: Date })[];
  colorByStage: Map<string, string>;
}) {
  const first = startOfMonth(month);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = first.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="mb-2 text-center text-xs font-semibold text-zinc-500">
        {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-zinc-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-8" />;
          const activeStage = stages.find((s) => inRange(day, s.startDate, s.endDate));
          return (
            <div
              key={i}
              title={activeStage?.name}
              className={`flex h-8 items-center justify-center rounded-md text-xs ${
                activeStage
                  ? `${colorByStage.get(activeStage.id)} font-semibold text-white`
                  : "text-zinc-600"
              }`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TournamentCalendar({ stages }: { stages: CalendarStage[] }) {
  const dated = stages.filter(
    (s): s is CalendarStage & { startDate: Date; endDate: Date } =>
      s.startDate !== null && s.endDate !== null,
  );

  if (dated.length === 0) {
    return <p className="text-sm text-zinc-400">No dated rounds yet.</p>;
  }

  const colorByStage = new Map<string, string>();
  dated.forEach((s, i) => colorByStage.set(s.id, STAGE_COLORS[i % STAGE_COLORS.length]));

  const earliest = dated.reduce((min, s) => (s.startDate < min ? s.startDate : min), dated[0].startDate);
  const latest = dated.reduce((max, s) => (s.endDate > max ? s.endDate : max), dated[0].endDate);

  const months: Date[] = [];
  const end = startOfMonth(latest);
  for (let cursor = startOfMonth(earliest); cursor <= end; cursor = addMonths(cursor, 1)) {
    months.push(cursor);
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className={`grid gap-6 ${months.length > 1 ? "sm:grid-cols-2" : "max-w-xs"}`}>
        {months.map((m) => (
          <MonthGrid key={m.toISOString()} month={m} stages={dated} colorByStage={colorByStage} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {dated.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className={`h-2.5 w-2.5 rounded-full ${colorByStage.get(s.id)}`} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
