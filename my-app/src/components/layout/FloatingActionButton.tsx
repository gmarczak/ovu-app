"use client";

import { Plus } from "lucide-react";

type FloatingActionButtonProps = {
    onClick: () => void;
    ariaLabel?: string;
};

export const FloatingActionButton = ({
    onClick,
    ariaLabel = "Add log",
}: FloatingActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95 sm:bottom-6"
        >
            <Plus size={24} />
        </button>
    );
};
