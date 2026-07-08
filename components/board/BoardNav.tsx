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
}: {
  items: BoardNavItem[];
  currentId: string;
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            item.id === currentId
              ? "bg-peach text-white"
              : "bg-white/80 text-umber hover:bg-mint/40"
          }`}
        >
          {item.label}
          {item.archived && " (lưu trữ)"}
          <span className="ml-1 text-xs opacity-70">· {SKIN_LABELS[item.skin]}</span>
        </Link>
      ))}
    </nav>
  );
}
