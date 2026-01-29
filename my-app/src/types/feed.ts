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
	| "headache"
	| "mood"
	| "energy"
	| "bloating"
	| "sleep";

export type PeriodLog = {
	id: string;
	userId?: string | null;
	startDate: string;
	endDate?: string | null;
	symptoms?: Symptom[] | null;
	notes?: string | null;
	createdAt?: string | null;
};
