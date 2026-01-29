type DayCellProps = {
    day: number;
    isToday?: boolean;
    isPeriod?: boolean;
    isFertile?: boolean;
    isMuted?: boolean;
};

export const DayCell = ({
    day,
    isToday,
    isPeriod,
    isFertile,
    isMuted,
}: DayCellProps) => {
    const base = "flex h-9 w-9 items-center justify-center rounded-full text-xs";
    const tone = isMuted
        ? "text-zinc-300"
        : "text-zinc-700 hover:bg-zinc-100";
    const period = isPeriod ? "bg-rose-100 text-rose-700" : "";
    const fertile = isFertile ? "bg-emerald-100 text-emerald-700" : "";
    const today = isToday ? "ring-2 ring-zinc-900/20" : "";

    return (
        <div className={`${base} ${tone} ${period} ${fertile} ${today}`}>
            {day}
        </div>
    );
};

type CalendarGridProps = {
    month: number;
    year: number;
    periodDays: number[];
    fertileDays: number[];
};

export const CalendarGrid = ({
    month,
    year,
    periodDays,
    fertileDays,
}: CalendarGridProps) => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const cells = Array.from({ length: startWeekday + daysInMonth }, (_, i) => {
        if (i < startWeekday) {
            return null;
        }
        return i - startWeekday + 1;
    });

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-900">
                    {firstDay.toLocaleString("default", { month: "long" })} {year}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-200" /> Period
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-200" /> Fertile
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <span key={`${day}-${index}`}>{day}</span>
                ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
                {cells.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="h-9" />;
                    }
                    const isToday =
                        day === today.getDate() &&
                        month === today.getMonth() &&
                        year === today.getFullYear();
                    return (
                        <DayCell
                            key={day}
                            day={day}
                            isToday={isToday}
                            isPeriod={periodDays.includes(day)}
                            isFertile={fertileDays.includes(day)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
