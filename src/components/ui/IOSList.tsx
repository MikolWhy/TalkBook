"use client";

import { ReactNode } from "react";
import {
    Listbox,
    ListboxSection,
    ListboxItem,
} from "@heroui/listbox";
import type { Selection } from "@react-types/shared";

export interface IOSListItem {
    id: string | number;
    title: string;
    description?: string;
    startContent?: ReactNode;
    endContent?: ReactNode;
    tags?: ReactNode;
    onClick?: () => void;
    isSelected?: boolean;
    bgColor?: string;
    borderColor?: string;
}

interface IOSListProps {
    items: IOSListItem[];
    onItemClick?: (item: IOSListItem) => void;
    selectedKeys?: Selection;
    emptyMessage?: string;
    className?: string;
}

// Helper function to get ring color RGB value from border color
// Returns RGB values for CSS custom property
function getRingColorRGB(borderColor?: string): string {
    if (!borderColor) return "156, 163, 175"; // gray-400

    // Map border colors to ring colors (400 shade RGB values)
    if (borderColor.includes("gray")) return "156, 163, 175"; // gray-400
    if (borderColor.includes("blue")) return "96, 165, 250"; // blue-400
    if (borderColor.includes("pink")) return "244, 114, 182"; // pink-400
    if (borderColor.includes("red")) return "248, 113, 113"; // red-400
    if (borderColor.includes("purple")) return "192, 132, 252"; // purple-400
    if (borderColor.includes("orange")) return "251, 146, 60"; // orange-400
    if (borderColor.includes("amber") || borderColor.includes("yellow")) return "251, 191, 36"; // amber-400
    if (borderColor.includes("rose")) return "251, 113, 133"; // rose-400
    if (borderColor.includes("indigo")) return "129, 140, 248"; // indigo-400
    if (borderColor.includes("emerald") || borderColor.includes("mint")) return "52, 211, 153"; // emerald-400

    return "156, 163, 175"; // gray-400 default
}

export default function IOSList({
    items,
    onItemClick,
    selectedKeys,
    emptyMessage = "No items",
    className = "",
}: IOSListProps) {
    const handleSelectionChange = (keys: Selection) => {
        if (keys !== "all" && keys !== null && typeof keys !== "string") {
            const keysSet = keys as Set<string | number>;
            if (keysSet.size > 0) {
                const selectedKey = Array.from(keysSet)[0];
                const selectedItem = items.find((item) => String(item.id) === String(selectedKey));
                if (selectedItem && onItemClick) {
                    onItemClick(selectedItem);
                }
            }
        }
    };

    if (items.length === 0) {
        return (
            <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
                <div className="p-5 flex-1 flex items-center justify-center">
                    <p className="text-gray-500 text-sm text-center py-8">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
            <Listbox
                aria-label="iOS style list"
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={handleSelectionChange}
                classNames={{
                    base: "bg-transparent border-0 p-0 max-w-full flex-1 flex flex-col min-h-0 overflow-hidden",
                    list: "ios-listbox-list px-3 py-3 gap-0 overflow-y-auto overflow-x-hidden scroll-smooth flex-1 min-h-0 max-h-full [-webkit-overflow-scrolling:touch]",
                }}
            >
                <ListboxSection showDivider={false}>
                    {items.map((item) => {
                        const ringColorRGB = getRingColorRGB(item.borderColor);

                        return (
                            <ListboxItem
                                key={String(item.id)}
                                textValue={item.title}
                                onPress={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                    }
                                    if (onItemClick) {
                                        onItemClick(item);
                                    }
                                }}
                                style={{
                                    '--ring-color': `rgb(${ringColorRGB})`,
                                    ...(item.bgColor ? {} : { backgroundColor: "var(--background, #ffffff)" }),
                                } as React.CSSProperties}
                                classNames={{
                                    base: `ios-list-item-animate ${item.bgColor || ''} rounded-2xl my-1.5 mx-0 p-0 min-h-[100px] transition-all duration-300 ease-out cursor-pointer border-2 ${item.borderColor || 'border-gray-100'} shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:scale-[1.005] active:translate-y-0 active:scale-100 [&>span[aria-hidden="true"]]:hidden`,
                                    wrapper: "px-5 py-4 flex flex-row items-center gap-4 min-h-[100px] justify-between",
                                }}
                            >
                                <div className="p-4 space-y-3">
                                    <div className="flex-1 flex flex-row items-center gap-4 min-w-0">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-semibold text-gray-900 leading-snug tracking-tight text-left">
                                                {item.title}
                                            </span>
                                            {item.description && (
                                                <span className="text-sm text-gray-600 leading-relaxed overflow-hidden text-ellipsis line-clamp-2 text-left">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>

                                        {item.endContent && (
                                            <div className="shrink-0 flex items-center">
                                                {item.endContent}
                                            </div>
                                        )}
                                    </div>
                                    {item.tags && (
                                        <div className="flex flex-wrap gap-1.5 mb-1">
                                            {item.tags}
                                        </div>
                                    )}
                                </div>
                            </ListboxItem>
                        );
                    })}
                </ListboxSection>
            </Listbox>
        </div>
    );
}
