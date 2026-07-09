"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export function UserMenu({
  companySlug,
  displayName,
}: {
  companySlug: string;
  displayName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-umber/10 bg-white/80 px-2 py-1 text-sm text-umber hover:bg-mint/20"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peach/30 font-heading text-sm text-umber">
          {initial}
        </span>
        <span className="max-w-[120px] truncate">{displayName}</span>
        <span className="text-xs text-umber/50">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[180px] rounded-xl border border-umber/10 bg-white py-1 shadow-lg"
        >
          <Link
            href={`/${companySlug}/account`}
            role="menuitem"
            className="block px-4 py-2 text-sm text-umber hover:bg-cream"
            onClick={() => setOpen(false)}
          >
            Tài khoản của tôi
          </Link>
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2 text-left text-sm text-umber/70 hover:bg-cream"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
