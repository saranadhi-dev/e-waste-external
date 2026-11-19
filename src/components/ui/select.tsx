import type { SelectHTMLAttributes } from "react";
import {
  FieldMessages,
  describedBy,
  fieldClasses,
  type FieldProps,
} from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldProps;

export function Select({ label, hint, error, id, className, children, ...props }: SelectProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-body font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          fieldClasses,
          "py-2 pr-8 appearance-none bg-no-repeat bg-[right_0.75rem_center] cursor-pointer",
          error ? "border-destructive focus-visible:outline-destructive" : "",
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b6b73' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundSize: "1.25rem 1.25rem",
        }}
        {...props}
      >
        {children}
      </select>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}
