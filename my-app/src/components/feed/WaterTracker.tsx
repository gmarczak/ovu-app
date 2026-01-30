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
        <div className="w-full rounded-3xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex flex-col items-center gap-3 w-full">
                <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">Water Intake</h3>
                <div className="flex justify-center gap-2.5">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => toggleGlass(index)}
                            className={`transition-all active:scale-90 ${
                                glassCount > index
                                    ? "text-blue-500"
                                    : "text-zinc-300 hover:text-zinc-400"
                            }`}
                            aria-label={`Glass ${index + 1}`}
                            title={`Glass ${index + 1}`}
                        >
                            <Droplet size={20} fill="currentColor" strokeWidth={0} />
                        </button>
                    ))}
                </div>
                <span className="text-xs font-medium text-zinc-600">{glassCount} of 8 glasses</span>
            </div>
        </div>
    );
};
