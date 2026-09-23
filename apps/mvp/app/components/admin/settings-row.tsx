import { AdminToggle } from "./admin-toggle";

export function SettingsRow({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">{label}</p>
        <p className="mt-1 text-sm leading-5 text-white/45">{description}</p>
      </div>
      <AdminToggle checked={checked} label={label} onChange={onChange} />
    </div>
  );
}
