export default function StrengthBar({
  value,
  accent,
}: {
  value: number;
  accent: string;
}) {
  return (
    <div>
      <div className="text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
        Signal strength
      </div>
      <div className="mt-[3px] text-[21px] font-bold leading-none tracking-[-0.02em]">
        {value}
        <span className="text-[11px] font-medium text-txt-3">/100</span>
      </div>
      <div className="mt-[7px] h-[6px] overflow-hidden rounded-full bg-white/10">
        <span
          className="block h-full rounded-full"
          style={{ width: `${value}%`, background: accent }}
        />
      </div>
    </div>
  );
}
