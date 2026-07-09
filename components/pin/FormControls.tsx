"use client";

import { useId } from "react";

const fieldClass =
  "w-full rounded-xl border border-umber/15 bg-white/90 px-3.5 py-2.5 text-sm text-umber shadow-sm transition focus:border-peach focus:outline-none focus:ring-2 focus:ring-peach/25";

export function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-umber/80">
      {children}
    </label>
  );
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${fieldClass} min-h-[88px] resize-y font-body ${props.className ?? ""}`}
    />
  );
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${fieldClass} appearance-none pr-9 ${props.className ?? ""}`}
      />
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-umber/40"
        aria-hidden
      >
        ▾
      </span>
    </div>
  );
}

export function FormCheckbox({
  checked,
  onChange,
  label,
  id: idProp,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-umber/10 bg-white/70 px-3.5 py-2.5 transition hover:border-peach/40"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-umber/20 bg-cream text-xs text-white transition peer-checked:border-peach peer-checked:bg-peach peer-focus-visible:ring-2 peer-focus-visible:ring-peach/30"
        aria-hidden
      >
        {checked ? "✓" : ""}
      </span>
      <span className="text-sm text-umber">{label}</span>
    </label>
  );
}

export function FormFileInput({
  name,
  onChange,
  id: idProp,
}: {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={`${fieldClass} flex cursor-pointer items-center justify-center gap-2 border-dashed bg-cream/60 text-umber/70 hover:border-peach/50 hover:bg-peach/5 peer-focus-visible:ring-2 peer-focus-visible:ring-peach/30`}
      >
        <span aria-hidden>📷</span>
        <span>Chọn ảnh từ thiết bị</span>
      </label>
    </div>
  );
}

export function FormReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-umber/10 bg-umber/5 px-3.5 py-2.5">
      <p className="text-xs text-umber/50">{label}</p>
      <p className="text-sm text-umber">{value}</p>
    </div>
  );
}
