"use client";

import { useEffect, useRef, useState, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown } from "react-icons/fi";
import type { ActionChoice, ScheduledAction } from "./action-space-state";
import { PinScrollArea } from "../pin-scroll-area";

type CalendarView = "day" | "week" | "month" | "year";
export type CalendarDateDrop = { action: ActionChoice; date: string };
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function CalendarSelect({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <div className="relative flex shrink-0 items-center">
    <select {...props} className="h-8 min-w-[5.5rem] cursor-pointer appearance-none rounded-full border border-white/25 bg-black pl-3 pr-9 text-xs font-medium text-white/80 outline-none hover:border-white/60 focus-visible:border-white">{children}</select>
    <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-3 text-white/65" />
  </div>;
}
function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function monthDays(year: number, month: number) {
  const first = new Date(year, month, 1, 12);
  const start = 1 - (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(year, month, start + index, 12));
}

function CalendarTimePicker({ drop, onSave, onClose }: { drop: CalendarDateDrop; onSave: (hour: number) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [hour, setHour] = useState(9);
  useEffect(() => { const dialog = dialogRef.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return createPortal(<dialog ref={dialogRef} aria-labelledby="calendar-time-title" className="m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-white/25 bg-[#111] p-5 text-white backdrop:bg-black/65" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <form onSubmit={(event) => { event.preventDefault(); onSave(hour); }}>
      <h2 id="calendar-time-title" className="text-base font-medium">Schedule action</h2>
      <p className="mt-3 break-words text-sm text-white/65">{drop.action.label} · {drop.date}</p>
      <label className="mt-4 block text-xs text-white/65">Time<select autoFocus value={hour} onChange={(event) => setHour(Number(event.target.value))} className="mt-2 block w-full rounded-lg border border-white/25 bg-black p-2 text-sm text-white">{Array.from({ length: 24 }, (_, value) => <option key={value} value={value}>{value % 12 || 12}:00 {value < 12 ? "AM" : "PM"}</option>)}</select></label>
      <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="cursor-pointer rounded-full border border-white/25 px-3 py-2 text-sm">Cancel</button><button type="submit" className="cursor-pointer rounded-full bg-white px-3 py-2 text-sm text-black">Schedule</button></div>
    </form>
  </dialog>, document.body);
}

export function ScenarioSchedule({ entries, pendingAction, hoveredSlot, onSchedule, onRemove, dateDrop, onDateDrop, onCancelDateDrop }: {
  entries: ScheduledAction[];
  pendingAction: ActionChoice | null;
  hoveredSlot: string | null;
  onSchedule: (action: ActionChoice, date: string, hour: number) => void;
  onRemove: (id: string) => void;
  dateDrop: CalendarDateDrop | null;
  onDateDrop: (drop: CalendarDateDrop) => void;
  onCancelDateDrop: () => void;
}) {
  const [date, setDate] = useState(localDate);
  const [view, setView] = useState<CalendarView>("day");
  const [previousView, setPreviousView] = useState<{ view: "month" | "year"; date: string } | null>(null);
  const selectedDate = new Date(`${date}T12:00:00`);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const changePeriod = (offset: number) => {
    const next = new Date(selectedDate);
    if (view === "year") { next.setDate(1); next.setFullYear(year + offset); }
    else if (view === "month") { next.setDate(1); next.setMonth(month + offset); }
    else next.setDate(next.getDate() + offset * (view === "week" ? 7 : 1));
    setDate(localDate(next));
  };
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const visibleDates = view === "week" ? Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart); day.setDate(day.getDate() + index); return localDate(day);
  }) : [date];
  const openDate = (target: string) => {
    if (pendingAction) onDateDrop({ action: pendingAction, date: target });
    else {
      if (view === "month" || view === "year") setPreviousView({ view, date });
      setDate(target);
      setView("day");
    }
  };
  const renderMonth = (monthIndex: number, compact = false) => <div className={compact ? "min-w-0" : "min-w-[28rem]"}>
    {compact && <h4 className="mb-2 text-xs font-medium text-white/70">{new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: "long" })}</h4>}
    <div className="grid grid-cols-7">{weekdays.map((day) => <span key={day} className="pb-2 text-center text-[0.6rem] text-white/40">{compact ? day[0] : day}</span>)}</div>
    <div className="grid grid-cols-7 border-l border-t border-white/15">
      {monthDays(year, monthIndex).map((day) => {
        const target = localDate(day);
        const scheduled = entries.filter((entry) => entry.date === target);
        return <button key={target} type="button" data-calendar-slot={`${target}/date`} data-calendar-date={target} aria-label={`Open ${target}${scheduled.length ? `, ${scheduled.length} scheduled actions` : ""}`} onClick={() => openDate(target)} className={`relative flex min-w-0 w-full cursor-pointer flex-col items-start border-b border-r border-white/15 p-1 text-left text-xs transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-white ${compact ? "min-h-8" : "min-h-24"} ${hoveredSlot === `${target}/date` ? "bg-white/15" : ""} ${day.getMonth() === monthIndex ? "text-white/75" : "text-white/25"}`}>
          <span>{day.getDate()}{compact && scheduled.length > 0 && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-white" />}</span>
          {!compact && scheduled.map((entry) => <span key={entry.id} className="mt-1 block w-full truncate bg-white/10 px-1 py-1 text-[0.6rem] text-white/75">{entry.hour % 12 || 12}{entry.hour < 12 ? "a" : "p"} · {entry.label}</span>)}
        </button>;
      })}
    </div>
  </div>;
  return <div className="flex h-full min-h-0 flex-col">
    <div className="shrink-0 px-3 pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <CalendarSelect aria-label="Calendar view" value={view} onChange={(event) => {
          setPreviousView(null);
          setView(event.target.value as CalendarView);
        }}>
          <option value="day">Day</option><option value="week">Week</option><option value="month">Month</option><option value="year">Year</option>
        </CalendarSelect>
        <button type="button" aria-label={`Previous ${view}`} className="cursor-pointer p-2 text-white/60 hover:text-white" onClick={() => changePeriod(-1)}>‹</button>
        {view === "day" && <input aria-label="Calendar date" type="date" value={date} onChange={(event) => { if (event.target.value) setDate(event.target.value); }} className="h-8 min-w-0 rounded-lg border border-white/25 bg-black px-2 text-xs text-white/80 [color-scheme:dark] focus-visible:outline focus-visible:outline-white" />}
        {view === "week" && <span aria-label="Selected calendar week" className="text-xs text-white/70">{new Date(`${visibleDates[0]}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} – {new Date(`${visibleDates[6]}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>}
        {view === "month" && <>
          <CalendarSelect aria-label="Calendar month" value={month} onChange={(event) => setDate(localDate(new Date(year, Number(event.target.value), 1, 12)))}>
            {Array.from({ length: 12 }, (_, index) => <option key={index} value={index}>{new Date(year, index, 1).toLocaleDateString(undefined, { month: "long" })}</option>)}
          </CalendarSelect>
          <span className="text-xs text-white/65">{year}</span>
        </>}
        {view === "year" && <CalendarSelect aria-label="Calendar year" value={year} onChange={(event) => {
          const next = new Date(selectedDate); next.setDate(1); next.setFullYear(Number(event.target.value)); setDate(localDate(next));
        }}>
          {Array.from({ length: 21 }, (_, index) => year - 10 + index).filter((value) => value >= 1000 && value <= 9999).map((value) => <option key={value} value={value}>{value}</option>)}
        </CalendarSelect>}
        <button type="button" aria-label={`Next ${view}`} className="cursor-pointer p-2 text-white/60 hover:text-white" onClick={() => changePeriod(1)}>›</button>
        {previousView && <nav aria-label="Calendar breadcrumb" className="ml-auto flex min-w-0 items-center gap-2 text-xs text-white/60">
          <button type="button" onClick={() => {
            setView(previousView.view);
            setDate(previousView.date);
            setPreviousView(null);
          }} className="cursor-pointer rounded-full px-2 py-1 text-left hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white">
            {previousView.view === "month" ? "Month" : "Year"} · {new Date(`${previousView.date}T12:00:00`).toLocaleDateString(undefined, previousView.view === "month" ? { month: "short", year: "numeric" } : { year: "numeric" })}
          </button>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Day</span>
        </nav>}
      </div>
      <p role="status" className="mt-2 text-xs text-white/45">{pendingAction ? `Choose a time for ${pendingAction.label}.` : "Drag an action here, or select an action and then a time."}</p>
    </div>
    <PinScrollArea aria-label="Schedule calendar" className="overflow-x-auto px-3 pb-4" wrapperClassName="min-h-0 flex-1">
      {view === "month" ? renderMonth(month) : view === "year" ? <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-5">{Array.from({ length: 12 }, (_, index) => <section key={index} aria-label={new Date(year, index, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}>{renderMonth(index, true)}</section>)}</div> : <div className={`border-t border-white/15 ${view === "week" ? "min-w-[42rem]" : ""}`}>
        {view === "week" && <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-white/15"><span />{visibleDates.map((day) => <span key={day} className="px-1 py-2 text-center text-[0.65rem] text-white/60">{new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>)}</div>}
        {Array.from({ length: 24 }, (_, hour) => {
          const time = `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;
          return <div key={hour} className="grid border-b border-white/15" style={{ gridTemplateColumns: `3rem repeat(${visibleDates.length}, minmax(0, 1fr))` }}>
            <span className="py-3 pr-2 text-[0.65rem] text-white/40">{time}</span>
            {visibleDates.map((day) => {
              const slot = `${day}/${hour}`;
              const scheduled = entries.filter((entry) => entry.date === day && entry.hour === hour);
              return <div key={day} data-calendar-slot={slot} data-calendar-date={day} data-calendar-hour={hour} className={`relative min-h-16 border-l border-white/15 p-1 ${hoveredSlot === slot ? "bg-white/15" : ""}`}>
              <button type="button" aria-label={`Schedule action at ${time} on ${day}`} aria-disabled={!pendingAction} onClick={() => { if (pendingAction) onSchedule(pendingAction, day, hour); }} className="absolute inset-0 cursor-pointer focus-visible:outline focus-visible:outline-white" />
              {scheduled.map((entry) => <div key={entry.id} className="relative mb-1 flex items-start justify-between gap-2 rounded-md bg-white/10 px-2 py-2 text-xs">
                <span className="break-words text-white/85">{entry.label}</span>
                <button type="button" aria-label={`Remove ${entry.label} from calendar`} onClick={() => onRemove(entry.id)} className="shrink-0 cursor-pointer text-white/50 hover:text-white">×</button>
              </div>)}
            </div>;
            })}
          </div>;
        })}
      </div>}
    </PinScrollArea>
    {dateDrop && <CalendarTimePicker drop={dateDrop} onClose={onCancelDateDrop} onSave={(hour) => { onSchedule(dateDrop.action, dateDrop.date, hour); onCancelDateDrop(); }} />}
  </div>;
}
