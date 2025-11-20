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
                base: `ios-list-item-animate bg-white rounded-xl my-1 p-0 min-h-[90px] transition-all duration-200 cursor-pointer border border-black/5 shadow-sm hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm active:bg-gray-100 data-[selected=true]:bg-blue-50 data-[selected=true]:border-blue-500 aria-selected:bg-blue-50 aria-selected:border-blue-500 dark:bg-[#1a1a1a] dark:border-white/10 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] dark:hover:bg-[#252525] dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.4)] dark:active:bg-[#2a2a2a] dark:data-[selected=true]:bg-[#1e3a5f] dark:data-[selected=true]:border-[#42a5f5] dark:aria-selected:bg-[#1e3a5f] dark:aria-selected:border-[#42a5f5]`,
                title: "text-base font-medium text-[#1a1a1a] leading-[1.4] dark:text-[#e0e0e0]",
                description: "text-sm text-gray-600 leading-[1.4] overflow-hidden text-ellipsis line-clamp-2 dark:text-[#999]",
                wrapper: "px-[18px] py-4 flex flex-col gap-1.5 min-h-[90px] justify-center",
              }}
            />
          ))}
        </ListboxSection>
      </Listbox>
    </div>
  );
}

