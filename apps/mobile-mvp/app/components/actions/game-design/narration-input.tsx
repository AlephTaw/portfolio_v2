"use client";

import { useEffect, useRef, useState } from "react";
import { useWatcher } from "../../watcher/watcher";

export function NarrationInput() {
  const { narration, setNarration } = useWatcher();
  const input = useRef<HTMLInputElement>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const [recording, setRecording] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!narration) { setUrl(null); return; }
    const next = URL.createObjectURL(narration);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [narration]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (recorder.current) {
        recorder.current.onstop = null;
        if (recorder.current.state !== "inactive") recorder.current.stop();
      }
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  function attach(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(file.name)) { setError("Choose an audio file for narration."); return; }
    setError(""); setNarration(file);
  }
  async function record() {
    if (recording) { recorder.current?.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("Microphone recording needs a supported browser on HTTPS or localhost. You can attach an audio file instead."); return; }
    setRequesting(true); setError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const next = new MediaRecorder(media);
      recorder.current = next;
      const chunks: BlobPart[] = [];
      next.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      next.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        if (!mounted.current) return;
        setRecording(false);
        if (chunks.length) setNarration(new File(chunks, `narration.${next.mimeType.includes("mp4") ? "m4a" : "webm"}`, { type: next.mimeType || "audio/webm" }));
      };
      next.onerror = () => { media.getTracks().forEach((track) => track.stop()); setRecording(false); setError("Recording failed. Please try again or attach an audio file."); };
      next.start(); setRecording(true);
    } catch {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (mounted.current) setError("Microphone access was unavailable. Please allow access or attach an audio file.");
    } finally { if (mounted.current) setRequesting(false); }
  }
  return <div className="mt-3">
    <input ref={input} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac" aria-label="Attach narration audio" className="sr-only" onChange={(event) => { attach(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />
    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!recording) attach(event.dataTransfer.files[0]); }} className="flex items-center gap-2 rounded-xl border border-dashed border-white/25 bg-black/15 p-2">
      <button type="button" disabled={requesting} onClick={record} aria-label={recording ? "Stop narration recording" : "Record narration"} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${recording ? "bg-red-400/25 text-red-200" : "bg-gray-400/30 text-white/80"}`}>
        {recording ? <span className="h-3 w-3 rounded-sm bg-current" /> : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M9 22h6" /></svg>}
      </button>
      <button type="button" disabled={recording} onClick={() => input.current?.click()} className="min-h-11 flex-1 text-left text-xs text-white/65">{recording ? "Recording… tap stop to finish" : requesting ? "Requesting microphone…" : "Record narration or drop / attach audio"}</button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-amber-200">{error}</p>}
    {narration && url && <div className="mt-3 min-w-0"><p className="truncate text-[10px] text-white/55">{narration.name}</p><audio controls src={url} className="mt-2 h-10 w-full" /><button type="button" onClick={() => setNarration(null)} className="min-h-11 text-xs text-white/55">Remove narration</button></div>}
    <p className="mt-2 text-[10px] text-white/40">Narration stays in this session. No server upload or transcription.</p>
  </div>;
}
