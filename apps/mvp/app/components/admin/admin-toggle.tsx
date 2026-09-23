export function AdminToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      aria-label={`Toggle ${label}`}
      aria-pressed={checked}
      className={`relative h-5 w-9 shrink-0 rounded-full border border-white/50 transition-colors ${
        checked ? "bg-white" : "bg-black"
      }`}
      onClick={onChange}
      type="button"
    >
      <span
        className={`absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition-[left] ${
          checked ? "left-[1.1rem] bg-black" : "left-0.5 bg-white/50"
        }`}
      />
    </button>
  );
}
