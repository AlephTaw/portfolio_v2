export function ArtworkTile({ image, position, label, aspect = "aspect-square" }: {
  image: string;
  position: string;
  label: string;
  aspect?: string;
}) {
  return <div role="img" aria-label={label} className={`relative overflow-hidden bg-[#242329] ${aspect}`} style={{
    backgroundImage: `url('${image}')`,
    backgroundSize: "300% auto",
    backgroundPosition: `${position} center`,
    backgroundRepeat: "no-repeat",
  }} />;
}
