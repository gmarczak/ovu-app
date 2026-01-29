import type { CyclePhase } from "../../types/feed";

type CycleStatusCardProps = {
	cycleDay: number;
	phase: CyclePhase;
	daysUntilNextPeriod: number;
};

const phaseCopy: Record<CyclePhase, string> = {
	menstrual: "Your body is shedding the uterine lining.",
	follicular: "Energy may rise as estrogen increases.",
	ovulation: "Fertility peaks around ovulation.",
	luteal: "Progesterone is higher; rest when needed.",
};

const phaseLabel: Record<CyclePhase, string> = {
	menstrual: "Menstrual",
	follicular: "Follicular",
	ovulation: "Ovulation",
	luteal: "Luteal",
};

export const CycleStatusCard = ({
	cycleDay,
	phase,
	daysUntilNextPeriod,
}: CycleStatusCardProps) => {
	return (
		<article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm text-zinc-500">Cycle day</p>
					<p className="text-3xl font-semibold text-zinc-900">{cycleDay}</p>
				</div>
				<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
					{phaseLabel[phase]}
				</span>
			</div>
			<p className="mt-3 text-sm text-zinc-600">{phaseCopy[phase]}</p>
			<div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
				{daysUntilNextPeriod === 1
					? "Next period expected tomorrow"
					: `Next period expected in ${daysUntilNextPeriod} days`}
			</div>
		</article>
	);
};

type PredictionCardProps = {
	nextPeriodStart: Date | null;
	fertileWindow: { start: Date; end: Date } | null;
};

export const PredictionCard = ({
	nextPeriodStart,
	fertileWindow,
}: PredictionCardProps) => {
	return (
		<article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
			<h3 className="text-base font-semibold text-zinc-900">Predictions</h3>
			<div className="mt-4 flex flex-col gap-3 text-sm text-zinc-600">
				<div className="flex items-center justify-between">
					<span>Next period</span>
					<span className="font-medium text-zinc-900">
						{nextPeriodStart ? nextPeriodStart.toLocaleDateString() : "—"}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span>Fertile window</span>
					<span className="font-medium text-zinc-900">
						{fertileWindow
							? `${fertileWindow.start.toLocaleDateString()} - ${fertileWindow.end.toLocaleDateString()}`
							: "—"}
					</span>
				</div>
			</div>
		</article>
	);
};
