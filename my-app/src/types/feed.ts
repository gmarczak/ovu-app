export type CyclePhase =
    | "menstrual"
    | "follicular"
    | "ovulation"
    | "luteal";

export type Cycle = {
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: string | null;
};

export type Symptom =
    | "cramps"
    | "backPain"
    | "headache"
    | "bloating"
    | "breastTenderness"
    | "fatigue"
    | "irritability"
    | "lowFocus";

export type Mood = "bad" | "neutral" | "good";

export type BleedingIntensity = "light" | "medium" | "heavy";

export type PeriodLog = {
    id: string;
    userId?: string | null;
    date: string; // NEW: single date field instead of startDate/endDate
    symptoms?: string[] | null;
    bleedingIntensity?: BleedingIntensity | null;
    mood?: Mood | null;
    notes?: string | null;
    createdAt?: string | null;
};
