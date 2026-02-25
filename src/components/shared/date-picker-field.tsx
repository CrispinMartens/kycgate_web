"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function DatePickerField({
  className,
  placeholder = "Select date",
  required = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<Date | undefined>(undefined);

  const formatted = useMemo(
    () => (value ? value.toLocaleDateString() : ""),
    [value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-datepicker-required={required ? "true" : "false"}
          data-datepicker-value={formatted}
          className={cn(
            "preview-kyc-datepicker-trigger w-full justify-between font-normal",
            !formatted && "text-[#86a1a9]",
            className,
          )}
        >
          <span>{formatted || placeholder}</span>
          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="preview-kyc-datepicker-content w-auto p-0"
        sideOffset={6}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            setValue(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
