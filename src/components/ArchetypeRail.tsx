import StrengthBar from "./StrengthBar";

export default function ArchetypeRail({
  archetype,
  strength,
  accent,
}: {
  archetype: string;
  strength: number;
  accent: string;
}) {
  return (
    <div
      className="flex shrink-0 basis-[152px] flex-col justify-between gap-[18px] border-r border-line bg-white/[0.02] p-[16px] pt-[18px] max-md:basis-auto max-md:flex-row max-md:items-center max-md:border-b max-md:border-r-0"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div
        className="text-[12px] font-bold uppercase leading-[1.3] tracking-[0.05em]"
        style={{ color: accent }}
      >
        {archetype}
      </div>
      <StrengthBar value={strength} accent={accent} />
    </div>
  );
}
