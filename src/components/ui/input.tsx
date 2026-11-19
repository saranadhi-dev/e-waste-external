import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
};

/** Wires hint/error text to a control via aria-describedby. */
export function describedBy(id?: string, hint?: string, error?: string) {
  if (!id) return undefined;
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export function FieldMessages({
  id,
  hint,
  error,
}: { id?: string } & Pick<FieldProps, "hint" | "error">) {
  return (
    <>
      {hint && (
        <p id={id && `${id}-hint`} className="text-caption">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={id && `${id}-error`}
          role="alert"
          className="text-caption !text-destructive font-medium"
        >
          {error}
        </p>
      )}
    </>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

export function Input({ label, hint, error, id, className, ...props }: InputProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-body font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          fieldClasses,
          error ? "border-destructive focus-visible:outline-destructive" : "",
          className
        )}
        {...props}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}
