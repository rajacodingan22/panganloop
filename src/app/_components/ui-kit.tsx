"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c6b4f]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-[#0d3527] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5e6f64]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-5 shadow-[0_18px_40px_-32px_rgba(13,53,39,0.45)] ${className}`}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#0d35271a] bg-[#fffdf8] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5e6f64]">
          {label}
        </p>
        {icon ? <span className="text-[#1c6b4f]">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-[#0d3527]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#5e6f64]">{hint}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "bg-[#f3efe4] text-[#6b5a32] border-[#ded3ba]",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#0d352733] bg-[#fffdf8]/70 px-6 py-12 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#e6ecdd] text-[#155c43]">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#5e6f64]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#155c43] text-white border-[#155c43] hover:bg-[#0f4a36] disabled:opacity-55",
  outline:
    "bg-transparent text-[#155c43] border-[#155c43] hover:bg-[#e6ecdd] disabled:opacity-55",
  ghost:
    "bg-transparent text-[#40564b] border-transparent hover:bg-[#0d35270d] disabled:opacity-55",
  danger:
    "bg-[#9b2c1a] text-white border-[#9b2c1a] hover:bg-[#7f2415] disabled:opacity-55",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0aa3e] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
        size === "sm" ? "px-3.5 py-2 text-xs" : "px-5 py-2.5 text-sm"
      } ${BUTTON_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0aa3e] focus-visible:ring-offset-2 ${
        size === "sm" ? "px-3.5 py-2 text-xs" : "px-5 py-2.5 text-sm"
      } ${BUTTON_STYLES[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#0d3527]">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-[#5e6f64]">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
      {error ? <span className="mt-1 block text-xs text-[#9b2c1a]">{error}</span> : null}
    </label>
  );
}

const FIELD_CLASS =
  "w-full rounded-xl border border-[#0d352726] bg-white px-3.5 py-2.5 text-sm text-[#0d3527] outline-none transition focus:border-[#1c6b4f] focus:ring-2 focus:ring-[#1c6b4f]/20 disabled:bg-[#f4f1e8]";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${FIELD_CLASS} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLASS} min-h-24 ${className}`} {...props} />;
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${FIELD_CLASS} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: ReactNode;
}) {
  const tones = {
    info: "border-[#c4d3f5] bg-[#eef3fd] text-[#1f3f88]",
    success: "border-[#b9dfc4] bg-[#e9f6ed] text-[#14532d]",
    warning: "border-[#efd9a6] bg-[#fdf6e5] text-[#7a5410]",
    error: "border-[#f0c5bc] bg-[#fdf0ed] text-[#9b2c1a]",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
  );
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0d352759] p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#0d35271a] bg-[#fffdf8] p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[#5e6f64]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-full p-1.5 text-[#5e6f64] hover:bg-[#0d35270d]"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function Spinner({ label = "Memuat data demo..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#5e6f64]">
      <span className="size-8 animate-spin rounded-full border-2 border-[#155c43] border-t-transparent" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
