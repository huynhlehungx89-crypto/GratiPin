"use client";

import Link from "next/link";
import type { BoardSkin } from "@/lib/utils/board";
import { SKIN_LABELS } from "@/lib/utils/board";

type BoardNavItem = {
  id: string;
  label: string;
  href: string;
  skin: BoardSkin;
  archived?: boolean;
};

export function BoardNav({
  items,
  currentId,
  companySlug,
  canManageCurrentBoard = false,
}: {
  items: BoardNavItem[];
  currentId: string;
  companySlug: string;
  canManageCurrentBoard?: boolean;
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.id === currentId;
        const pillClass = `rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-peach text-white"
            : "bg-white/80 text-umber hover:bg-mint/40"
        }`;

        if (isActive && canManageCurrentBoard) {
          return (
            <div
              key={item.id}
              className={`inline-flex items-center gap-1 ${pillClass}`}
            >
              <Link href={item.href} className="text-inherit">
                {item.label}
                {item.archived && " (lưu trữ)"}
                <span className="ml-1 text-xs opacity-70">· {SKIN_LABELS[item.skin]}</span>
              </Link>
              <Link
                href={`/${companySlug}/board/${item.id}/settings`}
                title="Cài đặt bảng"
                aria-label="Cài đặt bảng"
                className="rounded-full px-1.5 py-0.5 text-base leading-none opacity-90 transition hover:bg-white/20"
              >
                ⚙️
              </Link>
            </div>
          );
        }

        return (
          <Link key={item.id} href={item.href} className={pillClass}>
            {item.label}
            {item.archived && " (lưu trữ)"}
            <span className="ml-1 text-xs opacity-70">· {SKIN_LABELS[item.skin]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
