"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export function AfterActionReports() {
  const [open, setOpen] = useState(false);
  const [reportComplete, setReportComplete] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: PointerEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  function completeReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReportComplete(true);
  }

  return (
    <div ref={panelRef}>
      {!open ? (
        <button
          aria-controls="after-action-report-form"
          aria-expanded="false"
          className="w-full border-2 border-black bg-[#e5e5e5] p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:p-5"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-[#191919]">
            After Action Reports
          </span>
          <span className="mt-4 flex min-h-28 items-center justify-center border border-dashed border-[#a7a7a7] bg-background/60 px-4 text-center sm:min-h-32">
            <span className="max-w-xs text-[0.48rem] uppercase leading-relaxed tracking-[0.16em] text-[#7f7f7f]">
              Completed campaign reviews, lessons learned, and next actions will
              live here.
            </span>
          </span>
        </button>
      ) : null}
      <form
        className={open ? "mt-6 border-t border-black pt-5" : "hidden"}
        id="after-action-report-form"
        onSubmit={completeReport}
      >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#6d6d6d]">
          After Action Report
        </p>
        <p
          aria-live="polite"
          className="text-[0.5rem] uppercase tracking-[0.2em] text-[#7f7f7f]"
        >
          {reportComplete ? "Complete" : "Draft"}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-[0.5rem] uppercase tracking-[0.2em] text-[#6d6d6d]">
          Report
          <input
            className="min-w-0 border border-black bg-background px-3 py-2 text-[0.65rem] normal-case tracking-normal text-black outline-none focus:ring-1 focus:ring-black"
            name="report"
            onChange={() => setReportComplete(false)}
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-[0.5rem] uppercase tracking-[0.2em] text-[#6d6d6d]">
          Date
          <input
            className="min-w-0 border border-black bg-background px-3 py-2 text-[0.65rem] tracking-normal text-black outline-none focus:ring-1 focus:ring-black"
            name="date"
            onChange={() => setReportComplete(false)}
            required
            type="date"
          />
        </label>
        <label className="grid gap-2 text-[0.5rem] uppercase tracking-[0.2em] text-[#6d6d6d] sm:col-span-2">
          Objective
          <input
            className="min-w-0 border border-black bg-background px-3 py-2 text-[0.65rem] normal-case tracking-normal text-black outline-none focus:ring-1 focus:ring-black"
            name="objective"
            onChange={() => setReportComplete(false)}
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-[0.5rem] uppercase tracking-[0.2em] text-[#6d6d6d] sm:col-span-2">
          What happened?
          <textarea
            className="min-h-24 resize-y border border-black bg-background px-3 py-2 text-[0.65rem] normal-case tracking-normal text-black outline-none focus:ring-1 focus:ring-black"
            name="observations"
            onChange={() => setReportComplete(false)}
            required
          />
        </label>
        <label className="grid gap-2 text-[0.5rem] uppercase tracking-[0.2em] text-[#6d6d6d]">
          Lessons learned
          <textarea
            className="min-h-24 resize-y border border-black bg-background px-3 py-2 text-[0.65rem] normal-case tracking-normal text-black outline-none focus:ring-1 focus:ring-black"
            name="lessons"
            onChange={() => setReportComplete(false)}
            required
          />
        </label>
        <label className="grid gap-2 text-[0.5rem] uppercase tracking-[0.2em] text-[#6d6d6d]">
          Next action
          <textarea
            className="min-h-24 resize-y border border-black bg-background px-3 py-2 text-[0.65rem] normal-case tracking-normal text-black outline-none focus:ring-1 focus:ring-black"
            name="nextAction"
            onChange={() => setReportComplete(false)}
            required
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          className="whitespace-nowrap border border-black bg-transparent px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-[#f5f5f5]"
          type="submit"
        >
          Complete Report
        </button>
      </div>
      </form>
    </div>
  );
}
