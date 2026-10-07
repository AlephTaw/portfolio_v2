export function DesignSystemSummary() {
  const rules = [
    ["Palette", "Space black #000 · accent blue #353f89 · focus cyan #0ac2f0. Muted category accents: Health red, Wealth green, Connection orange, Sentience purple, Skills yellow, Journey magenta. Shared tokens keep app UIs, dock icons, context chips, progress and achievements consistent. The game-design Points earned element intentionally retains its original independent palette."],
    ["Glass", "The terminal container owns one glass layer; nested views and profile headers are transparent so tint and blur never stack. Adjustable blur (48px default, 0–80px) softens background detail, not interface text. Neutral adaptive tint samples mean linear luminance behind the container. Dark mode dims bright backdrops; light mode lifts dark backdrops. Discrete tiles, controls and separate dialogs retain their own surfaces."],
    ["Layout", "One centered terminal container owns the timeline, feed, composer, and navigation in both visor modes. It fills narrow viewports and caps at 629.8px, matching the content width limit. Revealing the timeline reserves its inner gutter. Composer and navigation stay independent of feed scrolling."],
    ["Shape & spacing", "Square terminal-container corners in both visor modes; pill view toggles and rounded item tiles inside. Spacing follows 4/8/12/16/24px steps."],
    ["Type & controls", "System sans; compact headings and muted secondary labels. Standard actions target at least 44px. Keyboard focus uses cyan. Active nav icons identify the shown view."],
    ["Navigation & motion", "Category and navbar apps share one active feed slot. Switching apps docks the previous app to the timeline; tapping an active nav icon minimizes it. The feed is full-height with the visor down, and defaults to 30% of the space above navigation with it up. Hold the open visor and glide vertically to resize; its fill indicator tracks height and returns to the helmet on release. Swipe right to reveal the timeline. Swipe left to hide a visible timeline; a separate left swipe with it hidden gradually docks the active app from any scroll position, revealing the timeline during the preview. Gesture ownership stays fixed until release or the end of the trackpad burst. Reverse to cancel. Vertical scrolling alone never docks. Journey retains its bottom-opening exception. Reduced motion removes the docking transform."],
    ["Anchors", "Timeline and resize dots are gold #b99a58 with the visor down, white with it up. View dots align to the top of live apps and archived thumbnails. Docking shows the bottom of existing history and reserves the incoming thumbnail’s exact slot; the timeline stays visible after landing until explicitly hidden. With the visor up, only the timeline’s upper 16px is clipped; content has no artificial top padding. Its counter sits below the cutoff. The cog is space black when down and glass when up."],
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
