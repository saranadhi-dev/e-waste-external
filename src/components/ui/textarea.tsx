import type { TextareaHTMLAttributes } from "react";
import {
  FieldMessages,
  describedBy,
  fieldClasses,
  type FieldProps,
} from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export function Textarea({ label, hint, error, id, className, ...props }: TextareaProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-body font-medium text-foreground">
          {label}
        </label>
      )}
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          fieldClasses,
          "min-h-24 resize-y py-2",
          error ? "border-destructive focus-visible:outline-destructive" : "",
          className,
        )}
        {...props}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}
