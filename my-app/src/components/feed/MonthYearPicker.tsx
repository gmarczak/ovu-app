"use client";

import { X } from "lucide-react";
import { Button } from "../ui/Button";

type MonthYearPickerProps = {
    open: boolean;
    onClose: () => void;
    currentMonth: number;
    currentYear: number;
    onSelect: (month: number, year: number) => void;
};

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = [2025, 2026, 2027];

export const MonthYearPicker = ({
    open,
    onClose,
    currentMonth,
    currentYear,
    onSelect,
}: MonthYearPickerProps) => {
    if (!open) return null;

    const handleSelect = (month: number, year: number) => {
        onSelect(month, year);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 transition-opacity"
                onClick={onClose}
                aria-hidden
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-zinc-900">Jump to Month</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} className="text-zinc-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Year Selection */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Year
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {YEARS.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => handleSelect(currentMonth, year)}
                                        className={`rounded-2xl py-3 px-4 text-sm font-semibold transition-all ${year === currentYear
                                                ? "bg-rose-500 text-white shadow-md"
                                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Month Selection */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Month
                            </label>
                            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                {MONTHS.map((month, index) => (
                                    <button
                                        key={month}
                                        onClick={() => handleSelect(index, currentYear)}
                                        className={`rounded-2xl py-3 px-4 text-sm font-semibold transition-all ${index === currentMonth && currentYear === currentYear
                                                ? "bg-rose-500 text-white shadow-md"
                                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                            }`}
                                    >
                                        {month.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
