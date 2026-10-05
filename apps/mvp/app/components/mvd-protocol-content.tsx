import type { MvdProtocol } from "./mvd-protocols";

export function MvdProtocolContent({ protocols }: { protocols: readonly MvdProtocol[] }) {
  if (!protocols.length) return null;
  return (
    <section aria-label="Minimum Viable Day protocols" className="mt-5 space-y-5">
      <h3 className="text-xs font-medium text-white/50">Minimum Viable Day (MVD)</h3>
      {protocols.map((protocol) => (
        <section key={protocol.id} aria-label={`${protocol.category} ${protocol.title} protocol`}>
          <h4 className="text-sm font-medium text-white/85">
            {protocol.focus && <span role="img" aria-label="Focus area">⭐ </span>}
            {protocol.title}
          </h4>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-white/65">
            {protocol.items.map((item, index) => (
              <li key={`${index}-${item.label}`}>
                {protocol.stageRisk && <span role="img" aria-label="Stage-failure risk">🔥 </span>}
                {item.points && <span className="text-white/85">{item.points}: </span>}{item.label}
              </li>
            ))}
          </ul>
          {protocol.note && <p className="mt-2 text-xs leading-5 text-white/50">{protocol.note}</p>}
        </section>
      ))}
    </section>
  );
}
