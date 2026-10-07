"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { FieldReportView } from "../../../actions/views/field-report-view";
import { JourneyApp } from "./journey-app";

const tabs = ["Quest plan", "Field report"] as const;

export function JourneyTabs() {
  const id = useId();
  const [activeTab, setActiveTab] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
      : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActiveTab(next);
    buttons.current[next]?.focus();
  }

  return <section aria-label="Journey">
    <div role="tablist" aria-label="Journey sections" className="mb-5 flex gap-2">
      {tabs.map((label, index) => <button
        key={label}
        ref={(button) => { buttons.current[index] = button; }}
        type="button"
        role="tab"
        id={`${id}-tab-${index}`}
        aria-controls={`${id}-panel-${index}`}
        aria-selected={activeTab === index}
        tabIndex={activeTab === index ? 0 : -1}
        className="planner-button"
        onClick={() => setActiveTab(index)}
        onKeyDown={(event) => navigate(event, index)}
      >{label}</button>)}
    </div>
    {/* Keep both views mounted so switching tabs preserves in-progress edits. */}
    <div role="tabpanel" id={`${id}-panel-0`} aria-labelledby={`${id}-tab-0`} hidden={activeTab !== 0}>
      <JourneyApp />
    </div>
    <div role="tabpanel" id={`${id}-panel-1`} aria-labelledby={`${id}-tab-1`} hidden={activeTab !== 1}>
      <FieldReportView />
    </div>
  </section>;
}
