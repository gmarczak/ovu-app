"use client";

import { useEffect, useMemo, useState } from "react";

import { CycleProgress } from "../../../components/feed/CycleProgress";
import { SymptomGrid } from "../../../components/feed/SymptomPills";
import { LogModal } from "../../../components/feed/LogModal";
import { CycleSettingsModal } from "../../../components/feed/CycleSettingsModal";
import { CalendarGrid } from "../../../components/feed/SwipeCard";
import { InsightsSection } from "../../../components/insights/InsightsSection";
import { CycleStats } from "../../../components/insights/CycleStats";
import { PDFReportGenerator } from "../../../components/insights/PDFReportGenerator";
import { BottomNav } from "../../../components/layout/BottomNav";
import { Header } from "../../../components/layout/Header";
import { TabNav } from "../../../components/layout/TabNav";
import { FloatingActionButton } from "../../../components/layout/FloatingActionButton";
import { Button } from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Input";
import { WaterTracker } from "../../../components/feed/WaterTracker";
import { PhaseInsights } from "../../../components/feed/PhaseInsights";
import { LoggingModal } from "../../../components/feed/LoggingModal";
import { MonthYearPicker } from "../../../components/feed/MonthYearPicker";
import { DayPreviewCard } from "../../../components/feed/DayPreviewCard";
import { useAuth } from "../../../hooks/useAuth";
import { symptomLabels, useCycle } from "../../../hooks/useSwipe";
import type {
    BleedingIntensity,
    Mood,
    PeriodLog,
    Symptom,
} from "../../../types/feed";
import {
    getCycleProfile,
    getDailyLogs,
    saveDailyLog,
    updateCycleProfile,
    deleteLogById,
} from "../../../lib/db";
import {
    calculateCycleData,
    getCyclePhase,
    getCycleDayForDate,
    getPredictedPeriodDaysForMonth,
    getFertileDaysForMonth,
    getOvulationDayForMonth,
    DEFAULT_CYCLE_LENGTH,
    DEFAULT_PERIOD_LENGTH,
} from "../../../lib/predictions";

// ============================================================================
// CENTRALIZED STATE MANAGEMENT & PERSISTENCE LOGIC
// ============================================================================

const STORAGE_KEY = "cycle_data_v1";

interface CycleState {
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: string | null;
}

const loadFromStorage = (): CycleState | null => {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const saveToStorage = (state: CycleState) => {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        console.error("Failed to save cycle data to localStorage");
    }
};

export default function FeedPage() {
    const { user } = useAuth();

    // ========================================================================
    // MAIN CYCLE STATE
    // ========================================================================
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [lastPeriodStart, setLastPeriodStart] = useState<string | null>(null);

    // ========================================================================
    // LOGGING STATE
    // ========================================================================
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [customSymptoms, setCustomSymptoms] = useState<string[]>([]);
    const [mood, setMood] = useState<Mood>("neutral");
    const [bleedingIntensity, setBleedingIntensity] =
        useState<BleedingIntensity>("medium");
    const [waterIntake, setWaterIntake] = useState<number>(0);
    const [notes, setNotes] = useState("");
    const [logs, setLogs] = useState<PeriodLog[]>([]);
    const [logError, setLogError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ========================================================================
    // UI STATE
    // ========================================================================
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedLogForModal, setSelectedLogForModal] = useState<PeriodLog | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "calendar" | "analysis">("today");
    const [showLoggingModal, setShowLoggingModal] = useState(false);
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [currentViewDate, setCurrentViewDate] = useState(() => new Date());
    const [previewLog, setPreviewLog] = useState<PeriodLog | null>(null);

    // COMPUTED VALUES: Cycle Calculations
    // ========================================================================
    const cycle = useMemo(
        () => ({ cycleLength, periodLength, lastPeriodStart }),
        [cycleLength, periodLength, lastPeriodStart]
    );

    const { cycleDay, phase, daysUntilNextPeriod, avgCycleLength, avgPeriodLength, isNewUser } =
        useCycle(cycle, logs);

    // ========================================================================
    // SYNC EFFECT: Load from Supabase on mount, then localStorage as fallback
    // ========================================================================
    useEffect(() => {
        const loadInitialData = async () => {
            // First, check localStorage for immediate UI update (offline support)
            const stored = loadFromStorage();
            if (stored) {
                setCycleLength(stored.cycleLength);
                setPeriodLength(stored.periodLength);
                setLastPeriodStart(stored.lastPeriodStart);
            }

            // Then fetch from Supabase if user is authenticated
            if (user?.id) {
                try {
                    const [profile, logData] = await Promise.all([
                        getCycleProfile(user.id),
                        getDailyLogs(user.id),
                    ]);

                    setCycleLength(profile.cycleLength);
                    setPeriodLength(profile.periodLength);
                    setLastPeriodStart(profile.lastPeriodStart);
                    setLogs(logData);

                    // Derive averages from historical logs
                    const derived = getDerivedCycle(logData);
                    if (derived.cycleLength) {
                        setCycleLength(derived.cycleLength);
                    }
                    if (derived.periodLength) {
                        setPeriodLength(derived.periodLength);
                    }
                    if (derived.lastPeriodStart) {
                        setLastPeriodStart(derived.lastPeriodStart);
                    }
                } catch (error) {
                    console.error("Failed to load cycle profile:", error);
                }
            }

            setIsInitialized(true);
        };

        loadInitialData();
    }, [user?.id]);

    // ========================================================================
    // SYNC EFFECT: Persist cycle state to localStorage whenever it changes
    // ========================================================================
    useEffect(() => {
        if (isInitialized) {
            saveToStorage({
                cycleLength,
                periodLength,
                lastPeriodStart,
            });
        }
    }, [cycleLength, periodLength, lastPeriodStart, isInitialized]);

    // ========================================================================
    // EVENT HANDLERS: Daily Logging
    // ========================================================================
    const handleSaveLog = async () => {
        if (!user?.id) {
            setLogError("Sign in to save an entry.");
            return;
        }
        setLogError(null);
        setSuccessMessage(null);
        setIsSaving(true);

        const bleedingValue = bleedingIntensity === "none" ? "none" : bleedingIntensity;

        const dateToSave = selectedDate || new Date().toISOString().slice(0, 10);
        const { error } = await saveDailyLog(user.id, dateToSave, {
            mood,
            bleeding: bleedingValue,
            symptoms: selectedSymptoms,
            notes: notes || undefined,
            waterIntake: waterIntake > 0 ? waterIntake : undefined,
        });

        setIsSaving(false);

        if (error) {
            setLogError(error);
            return;
        }

        // Show success message
        setSuccessMessage("✓ Entry saved!");
        setTimeout(() => setSuccessMessage(null), 3000);

        // Reset form
        setSelectedSymptoms([]);
        setMood("neutral");
        setBleedingIntensity("medium");
        setWaterIntake(0);
        setNotes("");
        setSelectedDate(null);
        setSelectedLogForModal(null);

        // Refresh logs from database
        const updatedLogs = await getDailyLogs(user.id);
        setLogs(updatedLogs);
    };

    const handleWaterIntakeUpdate = async (count: number) => {
        setWaterIntake(count);

        if (!user?.id) {
            return;
        }

        const dateToSave = selectedDate || new Date().toISOString().slice(0, 10);

        try {
            const { error } = await saveDailyLog(user.id, dateToSave, {
                mood,
                bleeding: bleedingIntensity === "none" ? "none" : bleedingIntensity,
                symptoms: selectedSymptoms,
                notes: notes || undefined,
                waterIntake: count,
            });

            if (error) {
                console.error("Water intake sync failed:", error);
            }
        } catch (error) {
            console.error("Water intake schema error:", error);
        }
    };

    // ========================================================================
    // EVENT HANDLERS: Period Start (Update Cycle Profile)
    // ========================================================================
    const handleStartPeriod = async () => {
        if (!user?.id) {
            setLogError("Sign in to start a period.");
            return;
        }
        setLogError(null);
        setSuccessMessage(null);
        setIsSaving(true);

        const today = new Date().toISOString().slice(0, 10);
        const { error } = await updateCycleProfile(user.id, {
            cycleLength,
            periodLength,
            lastPeriodStart: today,
        });

        setIsSaving(false);

        if (error) {
            setLogError(error);
            return;
        }

        // Update local state (resets cycle to day 1)
        setLastPeriodStart(today);
        setSuccessMessage("✓ Period started!");
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // ========================================================================
    // EVENT HANDLERS: Cycle Settings
    // ========================================================================
    const handleSaveProfile = async (newCycle: typeof cycle) => {
        if (!user?.id) {
            return;
        }
        setIsSaving(true);
        try {
            await updateCycleProfile(user.id, newCycle);
            // Update local state
            setCycleLength(newCycle.cycleLength);
            setPeriodLength(newCycle.periodLength);
            setLastPeriodStart(newCycle.lastPeriodStart);
            setShowCycleModal(false);
        } catch (error) {
            console.error("Failed to save cycle profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // ========================================================================
    // EVENT HANDLERS: Modal & Delete
    // ========================================================================
    // ========================================================================
    // EVENT HANDLERS: Modal & Calendar Interaction
    // ========================================================================
    // Calculate cycle day for any given date
    const calculateCycleDayForDate = (dateStr: string): number => {
        if (!lastPeriodStart) return 1;
        const targetDate = new Date(dateStr + "T00:00:00");
        const lastPeriod = new Date(lastPeriodStart + "T00:00:00");
        return getCycleDayForDate(
            targetDate,
            lastPeriod,
            avgCycleLength || DEFAULT_CYCLE_LENGTH
        );
    };

    const handleCalendarDayClick = (dateStr: string) => {
        const clickedDate = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if future date
        if (clickedDate > today) {
            setToastMessage("You cannot log symptoms for future dates.");
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        setSelectedDate(dateStr);
        const foundLog = logs.find((log) => log.date === dateStr);

        if (foundLog) {
            // Show day preview first
            setPreviewLog(foundLog);
            setSelectedLogForModal(foundLog);
        } else {
            // No log - open empty modal for new entry
            setPreviewLog(null);
            setSelectedLogForModal(null);
            setSelectedSymptoms([]);
            setMood("neutral");
            setBleedingIntensity("medium");
            setNotes("");
            setShowLoggingModal(true);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        setIsDeleting(true);
        const { error } = await deleteLogById(logId);
        setIsDeleting(false);

        if (error) {
            setLogError(error);
            return;
        }

        // Remove from UI immediately
        setLogs((prev) => prev.filter((log) => log.id !== logId));
        setSelectedDate(null);
        setSelectedLogForModal(null);
        setSuccessMessage("✓ Entry deleted!");
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleCloseModal = () => {
        setSelectedLogForModal(null);
        setSelectedDate(null);
    };

    // Dynamically load form data based on selectedDate
    const currentDate = selectedDate || new Date().toISOString().slice(0, 10);
    const selectedLogForForm = logs.find((log) => log.date === currentDate);

    // Extract custom symptoms from all logs (symptoms not in the default list)
    useEffect(() => {
        const defaultSymptoms = Object.keys(symptomLabels) as Symptom[];
        const allSymptoms = new Set<string>();

        logs.forEach((log) => {
            log.symptoms?.forEach((symptom) => {
                if (!defaultSymptoms.includes(symptom as Symptom)) {
                    allSymptoms.add(symptom);
                }
            });
        });

        setCustomSymptoms(Array.from(allSymptoms));
    }, [logs]);

    // Load form with existing data if available
    useEffect(() => {
        if (selectedLogForForm && selectedDate) {
            setSelectedSymptoms(selectedLogForForm.symptoms || []);
            setMood(selectedLogForForm.mood || "neutral");
            setBleedingIntensity(selectedLogForForm.bleedingIntensity || "medium");
            setWaterIntake(selectedLogForForm.waterIntake || 0);
            setNotes(selectedLogForForm.notes || "");
        }
    }, [selectedDate, selectedLogForForm]);

    const handleAddCustomSymptom = (symptom: string) => {
        if (!customSymptoms.includes(symptom)) {
            setCustomSymptoms((prev) => [...prev, symptom]);
        }
        // Automatically select the newly added custom symptom
        if (!selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms((prev) => [...prev, symptom]);
        }
    };

    // ========================================================================
    // EVENT HANDLERS: Calendar Navigation
    // ========================================================================
    const handlePreviousMonth = () => {
        setCurrentViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleBackToToday = () => {
        setCurrentViewDate(new Date());
    };

    const handleMonthYearSelect = (month: number, year: number) => {
        setCurrentViewDate(new Date(year, month, 1));
    };

    const handleEditFromPreview = () => {
        if (previewLog) {
            // Load the log data into form state
            setSelectedSymptoms(previewLog.symptoms || []);
            setMood(previewLog.mood || "neutral");
            setBleedingIntensity(previewLog.bleedingIntensity || "medium");
            setNotes(previewLog.notes || "");
            setSelectedLogForModal(previewLog);
            setPreviewLog(null);
            setShowLoggingModal(true);
        }
    };

    // ========================================================================

    // ========================================================================
    // HELPER: Calendar visualization (uses dynamic month/year state)
    // ========================================================================
    const month = currentViewDate.getMonth();
    const year = currentViewDate.getFullYear();

    // Use prediction engine for calendar visualization
    const cycleData = calculateCycleData(
        lastPeriodStart,
        avgCycleLength || DEFAULT_CYCLE_LENGTH,
        avgPeriodLength || DEFAULT_PERIOD_LENGTH
    );

    const lastPeriodDate = lastPeriodStart ? new Date(lastPeriodStart + "T00:00:00") : null;
    const currentPhaseLabel = getCyclePhase(
        new Date(),
        lastPeriodDate,
        avgCycleLength || DEFAULT_CYCLE_LENGTH,
        avgPeriodLength || DEFAULT_PERIOD_LENGTH
    );

    const estimateStart = new Date();
    const estimateStartStr = estimateStart.toISOString().slice(0, 10);
    const calendarCycleData = lastPeriodStart
        ? cycleData
        : calculateCycleData(estimateStartStr, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH);

    const calendarPeriodLength = lastPeriodStart
        ? avgPeriodLength || DEFAULT_PERIOD_LENGTH
        : DEFAULT_PERIOD_LENGTH;

    const predictedPeriodDays = getPredictedPeriodDaysForMonth(
        month,
        year,
        calendarCycleData.nextPeriodStart,
        calendarPeriodLength
    );

    const fertileDays = getFertileDaysForMonth(
        month,
        year,
        calendarCycleData.fertileWindowStart,
        calendarCycleData.fertileWindowEnd
    );

    const ovulationDay = getOvulationDayForMonth(month, year, calendarCycleData.predictedOvulation);

    // ========================================================================
    // LOADING STATE
    // ========================================================================
    if (!isInitialized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900"></div>
                    <p className="text-sm text-zinc-600">Loading your cycle...</p>
                </div>
            </div>
        );
    }

    // ========================================================================
    // RENDER: Dashboard UI with Tabbed Navigation
    // ========================================================================
    const handleFabClick = () => {
        setActiveTab("today");
        setSelectedDate(null);
        setSelectedSymptoms([]);
        setMood("neutral");
        setBleedingIntensity("medium");
        setNotes("");
        setSelectedLogForModal(null);
        setShowLoggingModal(true);
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 via-white to-zinc-50 pb-24">
            <Header
                title="Your Cycle"
                subtitle={`Day ${cycleDay} of ${cycleLength}`}
                action={
                    <button
                        onClick={() => setShowCycleModal(true)}
                        className="rounded-full p-2 transition-colors hover:bg-zinc-100 active:scale-95"
                        title="Cycle settings"
                        aria-label="Open cycle settings"
                    >
                        ⚙️
                    </button>
                }
            />

            {/* Tab Navigation */}
            <TabNav
                tabs={[
                    { id: "today", label: "Today", icon: "📝" },
                    { id: "calendar", label: "Calendar", icon: "📅" },
                    { id: "analysis", label: "Analysis", icon: "📊" },
                ]}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as any)}
            />

            <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-3 sm:px-6 overflow-hidden">
                {/* ================================================================ */}
                {/* TAB: TODAY - 100% STATIC ZERO-SCROLL LAYOUT */}
                {/* ================================================================ */}
                {activeTab === "today" && (
                    <div className="flex h-[calc(100vh-theme(spacing.32))] w-full flex-col justify-start overflow-hidden touch-none gap-y-3.5">
                        {/* TOP GROUP: Cycle Card + Insights Card */}
                        <div className="flex flex-col gap-3.5 w-full">
                            {/* Cycle Progress Card - Full Width */}
                            <div className="w-full rounded-3xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm">
                                <div className="flex flex-col items-center justify-center w-full">
                                    <CycleProgress
                                        cycleDay={cycleDay}
                                        cycleLength={cycleLength}
                                        phase={phase}
                                        daysUntilNextPeriod={daysUntilNextPeriod}
                                    />
                                </div>
                            </div>

                            {/* Phase Insights Card - Full Width */}
                            <PhaseInsights phase={phase} cycleDay={cycleDay} />
                        </div>

                        {/* BOTTOM GROUP: Water Card + Log Button */}
                        <div className="flex flex-col gap-3.5 w-full">
                            {/* Water Tracker - Full Width */}
                            <WaterTracker initialCount={waterIntake} onUpdate={handleWaterIntakeUpdate} />

                            {/* Log Today's Symptoms Button */}
                            <button
                                onClick={() => {
                                    setSelectedDate(null);
                                    setSelectedSymptoms([]);
                                    setMood("neutral");
                                    setBleedingIntensity("medium");
                                    setWaterIntake(0);
                                    setNotes("");
                                    setSelectedLogForModal(null);
                                    setShowLoggingModal(true);
                                }}
                                className="w-full rounded-full bg-rose-500 px-6 py-3 text-white font-semibold text-sm hover:bg-rose-600 shadow-lg transition-all active:scale-95"
                            >
                                📝 Log Today's Symptoms
                            </button>
                        </div>
                    </div>
                )}

                {/* ================================================================ */}
                {/* TAB: CALENDAR */}
                {/* ================================================================ */}
                {activeTab === "calendar" && (
                    <>
                        {isNewUser && (
                            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                                <p className="text-sm font-semibold text-amber-900">
                                    Log your first period to unlock personalized predictions!
                                </p>
                                <button
                                    onClick={() => setShowCycleModal(true)}
                                    className="mt-3 inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                                >
                                    Set your last period
                                </button>
                            </div>
                        )}

                        {/* Predictions */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    Next Period
                                </p>
                                <div className="mt-2">
                                    {lastPeriodStart && cycleData.nextPeriodStart ? (
                                        <p className="text-lg font-semibold text-zinc-900">
                                            {cycleData.nextPeriodStart.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => setShowCycleModal(true)}
                                            className="rounded-xl bg-rose-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 transition-colors"
                                        >
                                            Set your last period
                                        </button>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {lastPeriodStart
                                        ? daysUntilNextPeriod > 0
                                            ? `in ${daysUntilNextPeriod}d`
                                            : "soon"
                                        : "Add your history to personalize"}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    Fertile
                                </p>
                                <div className="mt-2">
                                    {lastPeriodStart && cycleData.fertileWindowStart && cycleData.fertileWindowEnd ? (
                                        <p className="text-lg font-semibold text-zinc-900">
                                            {`${cycleData.fertileWindowStart.getDate()} - ${cycleData.fertileWindowEnd.getDate()}`}
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => setShowCycleModal(true)}
                                            className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                                        >
                                            Set your last period
                                        </button>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-zinc-500">
                                    {lastPeriodStart ? "window" : "Add your history to personalize"}
                                </p>
                            </div>
                        </div>

                        {/* Calendar */}
                        <CalendarGrid
                            month={month}
                            year={year}
                            predictedPeriodDays={predictedPeriodDays}
                            fertileDays={fertileDays}
                            ovulationDay={ovulationDay}
                            logs={logs}
                            selectedDate={selectedDate}
                            onClickDay={handleCalendarDayClick}
                            onPreviousMonth={handlePreviousMonth}
                            onNextMonth={handleNextMonth}
                            onBackToToday={handleBackToToday}
                            onOpenMonthYearPicker={() => setShowMonthYearPicker(true)}
                        />

                        {isNewUser && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                                Theoretical Cycle (Estimate)
                            </div>
                        )}

                        {/* Day Preview Card */}
                        {previewLog && selectedDate && (
                            <DayPreviewCard
                                log={previewLog}
                                cycleDay={calculateCycleDayForDate(selectedDate)}
                                onEdit={handleEditFromPreview}
                                onDelete={() => {
                                    handleDeleteLog(previewLog.id);
                                    setPreviewLog(null);
                                    setSelectedDate(null);
                                }}
                            />
                        )}
                    </>
                )}

                {/* ================================================================ */}
                {/* TAB: ANALYSIS */}
                {/* ================================================================ */}
                {activeTab === "analysis" && (
                    <>
                        <CycleStats
                            logs={logs}
                            cycleLength={cycleLength}
                            periodLength={periodLength}
                        />
                        <InsightsSection logs={logs} />
                        <PDFReportGenerator
                            logs={logs}
                            cycleLength={cycleLength}
                            periodLength={periodLength}
                            lastPeriodStart={lastPeriodStart}
                            userName={user?.email || "Patient"}
                        />
                    </>
                )}
            </main>

            {/* ================================================================ */}
            {/* Floating Action Button */}
            {/* ================================================================ */}
            {activeTab !== "today" && (
                <FloatingActionButton onClick={handleFabClick} />
            )}

            {/* ================================================================ */}
            {/* MODAL: Cycle Settings */}
            {/* ================================================================ */}
            <CycleSettingsModal
                open={showCycleModal}
                cycle={{ cycleLength, periodLength, lastPeriodStart }}
                onClose={() => setShowCycleModal(false)}
                onSave={handleSaveProfile}
                isSaving={isSaving}
            />

            {/* ================================================================ */}
            {/* MODAL: Log Details & Delete */}
            {/* ================================================================ */}
            <LogModal
                open={selectedDate !== null}
                log={selectedLogForModal}
                selectedDate={selectedDate || ""}
                onClose={handleCloseModal}
                onDelete={handleDeleteLog}
                isDeleting={isDeleting}
                hasExistingLog={selectedLogForModal !== null}
            />

            {/* ================================================================ */}
            {/* TOAST: Feedback Messages */}
            {/* ================================================================ */}
            {toastMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
                        <p className="text-sm font-medium text-amber-900">{toastMessage}</p>
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/* ================================================================ */}
            {/* MODAL: Month/Year Picker */}
            {/* ================================================================ */}
            <MonthYearPicker
                open={showMonthYearPicker}
                onClose={() => setShowMonthYearPicker(false)}
                currentMonth={currentViewDate.getMonth()}
                currentYear={currentViewDate.getFullYear()}
                onSelect={handleMonthYearSelect}
            />

            {/* ================================================================ */}
            {/* LOGGING MODAL: Bottom Sheet */}
            {/* ================================================================ */}
            <LoggingModal
                open={showLoggingModal}
                onClose={() => setShowLoggingModal(false)}
                onSave={handleSaveLog}
                isSaving={isSaving}
                selectedDate={selectedDate || new Date().toISOString().slice(0, 10)}
                logError={logError}
                successMessage={successMessage}
                mood={mood}
                setMood={setMood}
                bleedingIntensity={bleedingIntensity}
                setBleedingIntensity={setBleedingIntensity}
                notes={notes}
                setNotes={setNotes}
                selectedSymptoms={selectedSymptoms}
                setSelectedSymptoms={setSelectedSymptoms}
                customSymptoms={customSymptoms}
                onAddCustom={handleAddCustomSymptom}
                existingLog={selectedLogForModal}
            />

            {/* ================================================================ */}
            {/* NAVIGATION: Bottom Tab Bar */}
            {/* ================================================================ */}
            <BottomNav />
        </div>
    );
}

// ============================================================================
// HELPER FUNCTIONS: Date & Cycle Calculations
// ============================================================================

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const daysBetween = (start: Date, end: Date) => {
    const ms =
        end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
};

const getDerivedCycle = (logs: PeriodLog[]) => {
    if (!logs.length) {
        return { cycleLength: null, periodLength: null, lastPeriodStart: null };
    }

    // With new schema, logs have 'date' field instead of 'startDate'
    const sorted = [...logs].sort((a, b) =>
        new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
    );

    const lastLog = sorted[0];
    return {
        cycleLength: null,
        periodLength: null,
        lastPeriodStart: lastLog.date,
    };
};
