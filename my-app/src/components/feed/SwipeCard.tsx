"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodLog } from "../../types/feed";

type DayCellProps = {
    day: number;
    isToday?: boolean;
    isPeriod?: boolean;
    isPeriodPredicted?: boolean;
    isFertile?: boolean;
    isOvulation?: boolean;
    hasLog?: boolean;
    isDisabled?: boolean;
    isSelected?: boolean;
    onClickDay?: (day: number) => void;
};

export const DayCell = ({
    day,
    isToday,
    isPeriod,
    isPeriodPredicted,
    isFertile,
    isOvulation,
    hasLog,
    isDisabled,
    isSelected,
    onClickDay,
}: DayCellProps) => {
    const base = "relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium transition-colors";
    const tone = isDisabled || !onClickDay
        ? "text-zinc-300 cursor-not-allowed"
        : "text-zinc-700 hover:bg-zinc-100 cursor-pointer";

    // Period styling: rose-500 for logged, rose-100 for predicted
    const period = isPeriod
        ? "bg-rose-500 text-white font-bold"
        : isPeriodPredicted
            ? "bg-rose-100 text-rose-700"
            : "";

    const fertile = isFertile ? "bg-emerald-100 text-emerald-700" : "";
    const today = isToday ? "ring-2 ring-zinc-900/20" : "";
    const selected = isSelected ? "ring-2 ring-indigo-500 bg-indigo-50" : "";
    return (
        <button
            onClick={() => !isDisabled && onClickDay?.(day)}
            disabled={isDisabled}
            className={`${base} ${tone} ${period} ${fertile} ${today} ${selected}`}
            type="button"
            aria-label={`Day ${day}${hasLog ? " - has log" : ""}`}
        >
            <span>{day}</span>
            {isOvulation && (
                <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
            )}
            {hasLog && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            )}
        </button>
    );
};

type CalendarGridProps = {
    month: number;
    year: number;
    predictedPeriodDays?: number[];
    fertileDays: number[];
    ovulationDay?: number | null;
    logs?: PeriodLog[];
    onClickDay?: (date: string) => void;
    onPreviousMonth?: () => void;
    onNextMonth?: () => void;
    onBackToToday?: () => void;
    onOpenMonthYearPicker?: () => void;
    selectedDate?: string | null;
};

export const CalendarGrid = ({
    month,
    year,
    predictedPeriodDays = [],
    fertileDays,
    ovulationDay,
    logs = [],
    onClickDay,
    onPreviousMonth,
    onNextMonth,
    onBackToToday,
    onOpenMonthYearPicker,
    selectedDate,
}: CalendarGridProps) => {
    const today = new Date();
    const displayMonth = month;
    const displayYear = year;

    const firstDay = new Date(displayYear, displayMonth, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const cells = Array.from({ length: startWeekday + daysInMonth }, (_, i) => {
        if (i < startWeekday) {
            return null;
        }
        return i - startWeekday + 1;
    });

    // Build a map of which days have logs (any log) and bleeding logs (confirmed period)
    const logsMap = new Set<string>();
    const bleedingMap = new Set<string>();
    logs.forEach((log) => {
        if (log.date) {
            const logDate = new Date(log.date + "T00:00:00");
            if (logDate.getMonth() === displayMonth && logDate.getFullYear() === displayYear) {
                logsMap.add(log.date);
                if (log.bleedingIntensity) {
                    bleedingMap.add(log.date);
                }
            }
        }
    });

    const handleDayClick = (day: number) => {
        const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const clickedDate = new Date(displayYear, displayMonth, day);

        // Prevent clicking future dates
        if (clickedDate > todayDate) {
            return;
        }

        onClickDay?.(dateStr);
    };

    const isCurrentMonth = displayMonth === today.getMonth() && displayYear === today.getFullYear();
    const monthYearLabel = firstDay.toLocaleString("default", { month: "long", year: "numeric" });

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            {/* Calendar Header with Navigation */}
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onPreviousMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-zinc-700 transition-colors hover:bg-rose-100"
                        title="Previous month"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onOpenMonthYearPicker}
                        className="text-base font-semibold text-zinc-900 min-w-[160px] text-center hover:text-rose-600 transition-colors"
                        title="Jump to month"
                        type="button"
                    >
                        {monthYearLabel}
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-zinc-700 transition-colors hover:bg-rose-100"
                        title="Next month"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Today Button */}
                {!isCurrentMonth && (
                    <button
                        onClick={onBackToToday}
                        className="mx-auto text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
                    >
                        📅 Back to Today
                    </button>
                )}
            </div>

            {/* Legend */}
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 px-2">
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Period (Logged)
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-100" /> Period (Predicted)
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-200" /> Fertile
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Log
                </span>
                <span className="flex items-center gap-1">
                    <span className="text-base">🌸</span> Ovulation
                </span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <span key={`${day}-${index}`}>{day}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {cells.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="h-10" />;
                    }
                    const isToday =
                        day === today.getDate() &&
                        displayMonth === today.getMonth() &&
                        displayYear === today.getFullYear();
                    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const clickedDate = new Date(displayYear, displayMonth, day);
                    const isFuture = clickedDate > todayDate;
                    const hasLog = logsMap.has(dateStr);
                    const isPeriodLogged = bleedingMap.has(dateStr);
                    const isPeriodPredicted = predictedPeriodDays.includes(day) && !isPeriodLogged;
                    const isSelected = selectedDate === dateStr;
                    const isOvulation = ovulationDay === day;

                    return (
                        <DayCell
                            key={day}
                            day={day}
                            isToday={isToday}
                            isPeriod={isPeriodLogged}
                            isPeriodPredicted={isPeriodPredicted}
                            isFertile={fertileDays.includes(day)}
                            isOvulation={isOvulation}
                            hasLog={hasLog}
                            isDisabled={isFuture}
                            isSelected={isSelected}
                            onClickDay={handleDayClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};


