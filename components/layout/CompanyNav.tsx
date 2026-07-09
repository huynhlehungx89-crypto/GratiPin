"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setDefaultBoardAction } from "@/lib/actions/member";
import type { NavBoardOption } from "@/lib/data/nav";

function NavDropdown({
  label,
  href,
  children,
  badge,
}: {
  label: string;
  href?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openMenu() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }

  function scheduleClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 180);
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <div className="flex items-center gap-0.5">
        {href ? (
          <Link href={href} className="rounded-l-md px-1.5 py-1 hover:text-peach">
            {label}
          </Link>
        ) : (
          <span className="rounded-l-md px-1.5 py-1">{label}</span>
        )}
        <button
          type="button"
          aria-label={`Mở menu ${label}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={openMenu}
          className="rounded-r-md px-1 py-1 text-umber/60 hover:text-peach"
        >
          ▾
        </button>
        {badge}
      </div>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-umber/10 bg-white py-1.5 shadow-lg"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function CompanyNav({
  companySlug,
  defaultBoardHref,
  boards,
  defaultBoardId,
  isCompanyAdmin,
  canModerate,
  unreviewedPinCount,
}: {
  companySlug: string;
  defaultBoardHref: string;
  boards: NavBoardOption[];
  defaultBoardId: string | null;
  isCompanyAdmin: boolean;
  canModerate: boolean;
  unreviewedPinCount: number;
}) {
  const router = useRouter();
  const [settingId, setSettingId] = useState<string | null>(null);

  async function handleSetDefault(boardId: string) {
    setSettingId(boardId);
    const result = await setDefaultBoardAction({ companySlug, boardId });
    setSettingId(null);
    if (!result.error) router.refresh();
  }

  return (
    <>
      <NavDropdown label="Bảng ghim" href={defaultBoardHref}>
        {boards.length === 0 ? (
          <p className="px-3 py-2 text-sm text-umber/60">Chưa có bảng nào</p>
        ) : (
          boards.map((board) => (
            <div
              key={board.id}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-cream/80"
            >
              <Link
                href={board.href}
                className="min-w-0 flex-1 truncate px-1 text-sm text-umber hover:text-peach"
              >
                {board.label}
                {board.archived && (
                  <span className="ml-1 text-xs text-umber/50">(lưu trữ)</span>
                )}
              </Link>
              <button
                type="button"
                title={
                  defaultBoardId === board.id
                    ? "Bảng mặc định"
                    : "Đặt làm mặc định"
                }
                disabled={settingId === board.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleSetDefault(board.id);
                }}
                className={`shrink-0 rounded-md px-2 py-0.5 text-sm transition ${
                  defaultBoardId === board.id
                    ? "text-butter"
                    : "text-umber/30 hover:text-butter"
                }`}
              >
                {defaultBoardId === board.id ? "★" : "☆"}
              </button>
            </div>
          ))
        )}
      </NavDropdown>

      {canModerate && (
        <Link
          href={`/${companySlug}/admin/pins`}
          className="relative inline-flex items-center gap-1 hover:text-peach"
        >
          Kiểm duyệt
          {unreviewedPinCount > 0 && (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold leading-none text-white"
              title={`${unreviewedPinCount} ghim chưa xem`}
              aria-label={`${unreviewedPinCount} ghim chưa xem`}
            >
              !
            </span>
          )}
        </Link>
      )}

      {isCompanyAdmin && (
        <NavDropdown label="Cài đặt">
            <Link
              href={`/${companySlug}/admin/members`}
              className="block px-3 py-2 text-sm text-umber hover:bg-cream/80 hover:text-peach"
            >
              Thành viên
            </Link>
            <Link
              href={`/${companySlug}/admin/departments`}
              className="block px-3 py-2 text-sm text-umber hover:bg-cream/80 hover:text-peach"
            >
              Phòng ban
            </Link>
            <Link
              href={`/${companySlug}/admin/settings`}
              className="block px-3 py-2 text-sm text-umber hover:bg-cream/80 hover:text-peach"
            >
              Cài đặt công ty
            </Link>
          </NavDropdown>
      )}
    </>
  );
}
