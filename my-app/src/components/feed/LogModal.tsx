"use client";

import type { PeriodLog } from "../../types/feed";
import { Button } from "../ui/Button";

interface LogModalProps {
    open: boolean;
    log: PeriodLog | null;
    selectedDate: string;
    onClose: () => void;
    onDelete?: (logId: string) => Promise<void>;
    isDeleting: boolean;
    hasExistingLog: boolean;
}

const moodEmoji = {
    bad: "😢",
    neutral: "😐",
    good: "😊",
};

const bleedingEmoji = {
    light: "🔵",
    medium: "🟠",
    heavy: "🔴",
};

const symptomIcons: Record<string, string> = {
    cramps: "🤕",
    backPain: "🔙",
    headache: "🤐",
    bloating: "🫘",
    breastTenderness: "💔",
    fatigue: "😴",
    irritability: "😤",
    lowFocus: "👁️",
};

export function LogModal({
    open,
    log,
    selectedDate,
    onClose,
    onDelete,
    isDeleting,
    hasExistingLog,
}: LogModalProps) {
    if (!open) return null;

    const handleDelete = async () => {
        if (log?.id && onDelete) {
            await onDelete(log.id);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white shadow-lg transition-transform ${open ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className="mx-auto max-w-2xl p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-zinc-900">
                            {formatDate(selectedDate)}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-600"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {hasExistingLog && log ? (
                            <>
                                {/* Viewing existing log */}
                                {/* Mood & Bleeding */}
                                <div className="grid grid-cols-2 gap-4">
                                    {log.mood && (
                                        <div className="rounded-lg bg-zinc-50 p-4">
                                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                                Mood
                                            </p>
                                            <p className="mt-2 text-2xl">
                                                {moodEmoji[log.mood as keyof typeof moodEmoji]}
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-zinc-700 capitalize">
                                                {log.mood}
                                            </p>
                                        </div>
                                    )}
                                    {log.bleedingIntensity && (
                                        <div className="rounded-lg bg-zinc-50 p-4">
                                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                                Bleeding
                                            </p>
                                            <p className="mt-2 text-2xl">
                                                {bleedingEmoji[log.bleedingIntensity as keyof typeof bleedingEmoji]}
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-zinc-700 capitalize">
                                                {log.bleedingIntensity}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Symptoms */}
                                {log.symptoms && log.symptoms.length > 0 && (
                                    <div>
                                        <p className="mb-3 text-sm font-medium text-zinc-700">Symptoms</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {log.symptoms.map((symptom) => (
                                                <div
                                                    key={symptom}
                                                    className="flex flex-col items-center rounded-lg bg-rose-50 p-3"
                                                >
                                                    <span className="text-xl">
                                                        {symptomIcons[symptom] || "🔹"}
                                                    </span>
                                                    <span className="mt-1 text-xs font-medium text-zinc-600 text-center">
                                                        {symptom}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {log.notes && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium text-zinc-700">Notes</p>
                                        <p className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
                                            {log.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Delete Button */}
                                <div className="grid gap-3 border-t border-zinc-200 pt-4">
                                    <Button
                                        onClick={handleDelete}
                                        isLoading={isDeleting}
                                        disabled={isDeleting}
                                        variant="secondary"
                                        size="lg"
                                        title="Delete this entry permanently"
                                    >
                                        🗑️ Delete Entry
                                    </Button>
                                    <Button
                                        onClick={onClose}
                                        variant="primary"
                                        size="lg"
                                        title="Close this modal"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* No entry message */}
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                                    <p className="text-lg font-semibold text-amber-900">
                                        No entry for this day
                                    </p>
                                    <p className="mt-2 text-sm text-amber-700">
                                        Would you like to add one? Scroll down to the logging form and select this date.
                                    </p>
                                </div>

                                {/* Close Button */}
                                <Button
                                    onClick={onClose}
                                    variant="primary"
                                    size="lg"
                                    title="Close this modal"
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

