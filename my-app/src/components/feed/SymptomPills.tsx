"use client";

import { useState } from "react";
import type { Symptom } from "../../types/feed";
import { symptomLabels } from "../../hooks/useSwipe";

type SymptomPillProps = {
    symptom: string;
    isSelected: boolean;
    onChange: (selected: boolean) => void;
    isCustom?: boolean;
};

const symptomIcons: Record<string, string> = {
    cramps: "🤕",
    backPain: "🔙",
    headache: "🤯",
    bloating: "🫁",
    breastTenderness: "🩹",
    fatigue: "😴",
    irritability: "😤",
    lowFocus: "🧠",
};

export const SymptomPill = ({
    symptom,
    isSelected,
    onChange,
    isCustom = false,
}: SymptomPillProps) => {
    const icon = symptomIcons[symptom] || "🔹";
    const label = isCustom
        ? symptom
        : symptomLabels[symptom as Symptom]?.split(" ")[0] || symptom;

    return (
        <button
            onClick={() => onChange(!isSelected)}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2.5 text-xs font-medium transition-all active:scale-95 ${isSelected
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-center leading-tight">{label}</span>
        </button>
    );
};

type SymptomGridProps = {
    selectedSymptoms: string[];
    onSymptomChange: (symptom: string, selected: boolean) => void;
    customSymptoms?: string[];
    onAddCustom?: (symptom: string) => void;
};

export const SymptomGrid = ({
    selectedSymptoms,
    onSymptomChange,
    customSymptoms = [],
    onAddCustom,
}: SymptomGridProps) => {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customSymptom, setCustomSymptom] = useState("");

    const handleAddCustom = () => {
        if (customSymptom.trim() && onAddCustom) {
            onAddCustom(customSymptom.trim());
            setCustomSymptom("");
            setShowCustomInput(false);
        }
    };

    const defaultSymptoms = Object.keys(symptomLabels) as Symptom[];
    const allSymptoms = [...defaultSymptoms, ...customSymptoms];

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-2">
                {allSymptoms.map((symptom) => (
                    <SymptomPill
                        key={symptom}
                        symptom={symptom}
                        isSelected={selectedSymptoms.includes(symptom)}
                        onChange={(selected) => onSymptomChange(symptom, selected)}
                        isCustom={customSymptoms.includes(symptom)}
                    />
                ))}
            </div>

            {/* Add Custom Symptom */}
            {onAddCustom && (
                <div className="flex flex-col gap-2">
                    {!showCustomInput ? (
                        <button
                            onClick={() => setShowCustomInput(true)}
                            className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                        >
                            + Add Custom Symptom
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customSymptom}
                                onChange={(e) => setCustomSymptom(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                                placeholder="Enter symptom name..."
                                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                autoFocus
                            />
                            <button
                                onClick={handleAddCustom}
                                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                            >
                                Add
                            </button>
                            <button
                                onClick={() => {
                                    setShowCustomInput(false);
                                    setCustomSymptom("");
                                }}
                                className="rounded-lg bg-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-300"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
