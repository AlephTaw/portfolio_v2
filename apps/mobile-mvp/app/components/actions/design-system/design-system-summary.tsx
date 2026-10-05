export function DesignSystemSummary() {
  const rules = [
    ["Palette", "Space black #000 · accent blue #353f89 · focus cyan #0ac2f0. Category colors identify points and achievements."],
    ["Glass", "Adjustable window blur (48px default, 0–80px) softens background detail, not interface text. Neutral adaptive tint adds gentle desaturation; no diagonal texture. Tint samples mean linear luminance behind each visible window. Dark mode dims bright backdrops; light mode lifts dark backdrops."],
    ["Layout", "Centered windows fill narrow screens and cap at 629.8px. Revealing the timeline reserves its gutter. Navigation stays independent of window scrolling."],
    ["Shape & spacing", "Pill view toggles, rounded tiles, 24px window top corners. Full-height visor-down windows are square when the timeline is hidden. Spacing follows 4/8/12/16/24px steps."],
    ["Type & controls", "System sans; compact headings and muted secondary labels. Standard actions target at least 44px. Keyboard focus uses cyan. Active nav icons identify the shown view."],
    ["Navigation & motion", "One active window; tapping it closes it, another icon switches views. Visor state is independent. Open-visor windows launch at one-third height. Resize anchors support drag and arrow keys; reduced motion removes transitions."],
    ["Anchors", "Timeline and resize dots are gold #b99a58 with the visor down, white with it up. The cog is space black when down and glass when up."],
    ["Progress & state", "Earned/available points, category-colored completed hexagons, grey pending achievements. Configuration and progress currently live in this session only."],
  ];
  return <section aria-label="Design system summary" className="rounded-xl bg-black/15 p-3">
    <h3 className="text-xs font-medium text-white/85">System summary</h3>
    <dl className="mt-3 divide-y divide-white/10">{rules.map(([label, description]) => <div key={label} className="py-3 first:pt-0 last:pb-0">
      <dt className="text-[11px] font-medium text-white/75">{label}</dt>
      <dd className="mt-1 text-[11px] leading-5 text-white/55">{description}</dd>
    </div>)}</dl>
  </section>;
}
