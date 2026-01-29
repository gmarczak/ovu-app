"use client";

type Tab = {
    id: string;
    label: string;
    icon?: string;
};

type TabNavProps<T extends string = string> = {
    tabs: Tab[];
    activeTab: T;
    onTabChange: (tabId: T) => void;
};

export const TabNav = ({ tabs, activeTab, onTabChange }: TabNavProps) => {
    return (
        <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
            <div className="flex gap-0 px-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id as any)}
                        className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                ? "border-emerald-500 text-emerald-600"
                                : "border-transparent text-zinc-600 hover:text-zinc-900"
                            }`}
                    >
                        {tab.icon && <span className="mr-1">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
