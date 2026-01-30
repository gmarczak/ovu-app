"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SymptomGrid } from "./SymptomPills";
import { Input, Select } from "../ui/Input";
import { Button } from "../ui/Button";
import type { BleedingIntensity, Mood, PeriodLog } from "../../types/feed";

type LoggingModalProps = {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    isSaving: boolean;
    selectedDate: string;
    logError: string | null;
    successMessage: string | null;
    // Form state
    mood: Mood;
    setMood: (mood: Mood) => void;
    bleedingIntensity: BleedingIntensity;
    setBleedingIntensity: (intensity: BleedingIntensity) => void;
    notes: string;
    setNotes: (notes: string) => void;
    selectedSymptoms: string[];
    setSelectedSymptoms: (symptoms: string[]) => void;
    customSymptoms: string[];
    onAddCustom: (symptom: string) => void;
    existingLog: PeriodLog | null;
};

export const LoggingModal = ({
    open,
    onClose,
    onSave,
    isSaving,
    selectedDate,
    logError,
    successMessage,
    mood,
    setMood,
    bleedingIntensity,
    setBleedingIntensity,
    notes,
    setNotes,
    selectedSymptoms,
    setSelectedSymptoms,
    customSymptoms,
    onAddCustom,
    existingLog,
}: LoggingModalProps) => {
    if (!open) return null;

    const displayDate = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 transition-opacity"
                onClick={onClose}
                aria-hidden
            />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl border-t border-zinc-200 bg-white shadow-2xl animate-in slide-in-from-bottom">
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-zinc-900">Log Entry</h2>
                        <p className="text-xs text-zinc-500">{displayDate}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} className="text-zinc-600" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="grid gap-4">
                        {/* Mood & Bleeding - Side by Side */}
                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                label="Mood"
                                value={mood}
                                onChange={(e) => setMood(e.target.value as Mood)}
                                options={[
                                    { label: "😢 Bad", value: "bad" },
                                    { label: "😐 Neutral", value: "neutral" },
                                    { label: "😊 Good", value: "good" },
                                ]}
                            />
                            <Select
                                label="Bleeding"
                                value={bleedingIntensity}
                                onChange={(e) => setBleedingIntensity(e.target.value as BleedingIntensity)}
                                options={[
                                    { label: "None", value: "none" },
                                    { label: "Light", value: "light" },
                                    { label: "Medium", value: "medium" },
                                    { label: "Heavy", value: "heavy" },
                                ]}
                            />
                        </div>

                        {/* Notes */}
                        <Input
                            label="Notes"
                            placeholder="How are you feeling?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={200}
                        />

                        {/* Symptoms */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-zinc-900">
                                Symptoms ({selectedSymptoms.length})
                            </label>
                            <SymptomGrid
                                selectedSymptoms={selectedSymptoms}
                                onSymptomChange={(symptom, selected) => {
                                    setSelectedSymptoms(
                                        selected
                                            ? [...selectedSymptoms, symptom]
                                            : selectedSymptoms.filter((s) => s !== symptom)
                                    );
                                }}
                                customSymptoms={customSymptoms}
                                onAddCustom={onAddCustom}
                            />
                        </div>

                        {/* Messages */}
                        {successMessage && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                <p className="text-xs font-medium text-emerald-700 text-center">
                                    {successMessage}
                                </p>
                            </div>
                        )}
                        {logError && (
                            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                                <p className="text-xs font-medium text-rose-700">{logError}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="sticky bottom-0 border-t border-zinc-200 bg-white px-6 py-4">
                    <Button
                        onClick={onSave}
                        isLoading={isSaving}
                        disabled={isSaving}
                        variant="primary"
                        size="lg"
                        className="w-full"
                    >
                        {existingLog ? `✏️ Update Entry` : `💾 Save Entry`}
                    </Button>
                    <p className="mt-2 text-center text-xs text-zinc-500">
                        {isSaving ? "Saving..." : "All data saved securely"}
                    </p>
                </div>
            </div>
        </>
    );
};
