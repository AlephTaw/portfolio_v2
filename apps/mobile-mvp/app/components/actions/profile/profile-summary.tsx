import type { ReactNode } from "react";

type ProfileSummaryProps = {
  name: string;
  build: string;
  level: number;
  image: string;
  actions?: ReactNode;
};

export function ProfileSummary({ name, build, level, image, actions }: ProfileSummaryProps) {
  return <section aria-label="Profile summary" className="profile-glass flex items-center gap-3 px-3 py-3 text-white">
    <span role="img" aria-label={`${name} profile picture`} className="h-10 w-10 shrink-0 rounded-full bg-[#242329]" style={{
      backgroundImage: `url('${image}')`,
      backgroundSize: "300% auto",
      backgroundPosition: "50% 22%",
      backgroundRepeat: "no-repeat",
    }} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{name}</p>
      <p className="text-[11px] leading-4 text-white/45">{build} · Level {level}</p>
    </div>
    {actions && <div className="ml-auto shrink-0">{actions}</div>}
  </section>;
}
