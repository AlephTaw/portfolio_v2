import Link from "next/link";

export default function LiveGameplayPage() {
  return <main className="app-shell min-h-dvh bg-black">
    <header className="flex min-h-11 items-center justify-between gap-3">
      <h1 className="text-xs uppercase tracking-wider text-white/70">Live gameplay</h1>
      <Link href="/" className="inline-flex min-h-11 items-center px-3 text-xs text-white/60 hover:text-white">Back</Link>
    </header>
  </main>;
}
