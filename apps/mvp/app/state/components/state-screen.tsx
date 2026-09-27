"use client";

import StateDisplay from "../state-display";
import { CodeWorkspace } from "../../components/code-workspace";
import { useStateView } from "./state-view-context";

export function StateScreen() {
  const { editorOpen } = useStateView();
  return <>
    <div hidden={editorOpen}><StateDisplay /></div>
    {editorOpen && <div className="mx-auto flex min-h-[70dvh] w-[calc(100%-2*var(--composer-gutter))] max-w-[calc(var(--composer-max-width)-2*var(--composer-gutter))] flex-col"><CodeWorkspace /></div>}
  </>;
}
