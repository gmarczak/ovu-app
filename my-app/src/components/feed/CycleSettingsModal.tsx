"use client";

import { useState } from "react";

import { Button } from "../ui/Button";
import { Input, Select } from "../ui/Input";
import type { Cycle } from "../../types/feed";

type CycleSettingsModalProps = {
    open: boolean;
    cycle: Cycle;
    onClose: () => void;
    onSave: (cycle: Cycle) => void;
    isSaving?: boolean;
};

export const CycleSettingsModal = ({
    open,
    cycle,
    onClose,
    onSave,
    isSaving,
}: CycleSettingsModalProps) => {
    const [cycleLength, setCycleLength] = useState(cycle.cycleLength);
    const [periodLength, setPeriodLength] = useState(cycle.periodLength);
    const [lastPeriodStart, setLastPeriodStart] = useState(
        cycle.lastPeriodStart ?? ""
    );

    const handleSave = () => {
        onSave({
            cycleLength,
            periodLength,
            lastPeriodStart: lastPeriodStart || null,
        });
    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className="w-full max-w-md rounded-t-3xl bg-white p-6 sm:rounded-3xl">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        Cycle Settings
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Adjust your cycle lengths for more accurate predictions.
                    </p>
                </div>

                <div className="grid gap-4">
                    <Input
                        label="Cycle length (days)"
                        type="number"
                        min={20}
                        max={45}
                        value={cycleLength}
                        onChange={(event) => setCycleLength(Number(event.target.value))}
                    />
                    <Input
                        label="Period length (days)"
                        type="number"
                        min={2}
                        max={10}
                        value={periodLength}
                        onChange={(event) => setPeriodLength(Number(event.target.value))}
                    />
                    <Input
                        label="Last period start"
                        type="date"
                        value={lastPeriodStart}
                        onChange={(event) => setLastPeriodStart(event.target.value)}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        disabled={isSaving}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
