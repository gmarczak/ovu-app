"use client";

import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";

type WaterTrackerProps = {
	initialCount?: number;
	onUpdate?: (count: number) => void;
};

export const WaterTracker = ({ initialCount = 0, onUpdate }: WaterTrackerProps) => {
	const [glassCount, setGlassCount] = useState(initialCount);

	useEffect(() => {
		setGlassCount(initialCount);
	}, [initialCount]);

	const toggleGlass = (index: number) => {
		const newCount = glassCount === index + 1 ? index : index + 1;
		setGlassCount(newCount);
		onUpdate?.(newCount);
	};

	return (
		<div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-sm font-semibold text-zinc-900">💧 Water Intake</h3>
				<span className="text-xs font-medium text-blue-600">{glassCount}/8 glasses</span>
			</div>
			<div className="flex justify-center gap-2">
				{Array.from({ length: 8 }).map((_, index) => (
					<button
						key={index}
						onClick={() => toggleGlass(index)}
						className={`rounded-lg p-2 transition-all active:scale-95 ${
							glassCount > index
								? "bg-blue-500 text-white shadow-md"
								: "bg-blue-100 text-blue-400 hover:bg-blue-200"
						}`}
						aria-label={`Glass ${index + 1}`}
					>
						<Droplet size={20} fill="currentColor" />
					</button>
				))}
			</div>
		</div>
	);
};
