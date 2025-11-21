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
          list: "ios-listbox-list p-0 gap-0 overflow-y-auto overflow-x-hidden scroll-smooth flex-1 min-h-0 max-h-full [-webkit-overflow-scrolling:touch]",
        }}
      >
        <ListboxSection showDivider={false}>
          {items.map((item) => (
            <ListboxItem
              key={String(item.id)}
              title={item.title}
              description={item.description}
              startContent={item.startContent}
              endContent={item.endContent}
              onPress={() => {
                if (item.onClick) {
                  item.onClick();
                }
                if (onItemClick) {
                  onItemClick(item);
                }
              }}
              classNames={{
                base: `ios-list-item-animate ${item.bgColor || 'bg-white'} rounded-2xl my-2 p-0 min-h-[100px] transition-all duration-300 ease-out cursor-pointer border-2 ${item.borderColor || 'border-gray-100'} shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:scale-[1.01] active:translate-y-0 active:scale-100 data-[selected=true]:ring-4 data-[selected=true]:ring-blue-400 data-[selected=true]:ring-inset aria-selected:ring-4 aria-selected:ring-blue-400 aria-selected:ring-inset`,
                title: "text-[15px] font-semibold text-gray-900 leading-snug tracking-tight",
                description: "text-[13px] text-gray-600 leading-relaxed overflow-hidden text-ellipsis line-clamp-2 mt-1",
                wrapper: "px-5 py-4 flex flex-col gap-2 min-h-[100px] justify-center",
              }}
            />
          ))}
        </ListboxSection>
      </Listbox>
    </div>
  );
}

