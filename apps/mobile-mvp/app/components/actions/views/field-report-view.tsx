"use client";

import { useWatcher } from "../../watcher/watcher";
import { ActionComposer } from "../action-composer";
import { MvdChecklist } from "../field-report/mvd-checklist";
import { ReceiptAttachments } from "../field-report/receipt-attachments";
import { ComponentHeading, ComponentSystems } from "../settings/component-systems";
import { Storyboard } from "../game-design/storyboard";

export function FieldReportView({ preview = false }: { preview?: boolean }) {
  const { completedMvd, toggleMvd, reportDraft, setReportDraft, receipts, addReceipts, removeReceipt } = useWatcher();
  return <div className="view-glass min-h-full text-white">
    <header className="flex h-11 items-center px-4"><ComponentHeading target="activity" /></header>
    <ComponentSystems target="activity" />
    <MvdChecklist completed={completedMvd} onToggle={preview ? () => {} : toggleMvd} />
    <ReceiptAttachments receipts={receipts} onAdd={preview ? () => {} : addReceipts} onRemove={preview ? () => {} : removeReceipt} />
    <div className="px-4 pb-5"><Storyboard editable preview={preview} /></div>
    <section aria-label="Field report next action" className="px-1 pt-2">
      <div aria-label="Current action" className="mb-3 flex items-center justify-center gap-2 px-4">
        <svg role="img" aria-label="In progress" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/60 motion-safe:animate-spin" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="8" opacity="0.25" /><path d="M12 4a8 8 0 0 1 8 8" /></svg>
        <h2 className="text-center text-xs font-medium text-white/75">Minimum Viable Day</h2>
      </div>
      {/* Narrow viewports cannot contain the whole 64px rail in the gutter. */}
      <div className="mr-12 lg:mr-0"><ActionComposer value={reportDraft} onChange={preview ? () => {} : setReportDraft} /></div>
    </section>
  </div>;
}
