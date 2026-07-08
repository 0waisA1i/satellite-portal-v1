// Skeleton shown by Next.js App Router while page.tsx fetches data.
// Mirrors the FeedView layout so there is no layout shift on load.

function Bone({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse rounded-[6px] bg-white/[0.07] ${className ?? ""}`}
      style={style}
    />
  );
}

function CardSkeleton({ delay = 0 }: { delay?: number }) {
  const s = { animationDelay: `${delay}ms` };
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-panel">
      <div className="flex items-stretch max-md:flex-col">
        {/* archetype rail */}
        <div className="flex shrink-0 basis-[152px] flex-col justify-between gap-[18px] border-r border-line bg-white/[0.02] p-[16px] pt-[18px] max-md:basis-auto max-md:flex-row max-md:border-b max-md:border-r-0">
          <div className="flex flex-col gap-[5px]">
            <Bone className="h-[11px] w-[72px]" style={s} />
            <Bone className="h-[11px] w-[52px]" style={s} />
          </div>
          {/* strength bar */}
          <div className="flex flex-col gap-[5px]">
            <Bone className="h-[4px] w-full rounded-full" style={s} />
            <Bone className="h-[9px] w-[28px]" style={s} />
          </div>
        </div>

        {/* main content */}
        <div className="min-w-0 flex-1 p-[22px] pb-[16px] pt-[18px]">
          {/* top row: company + stat chips */}
          <div className="flex items-start justify-between gap-[18px] max-md:flex-col">
            <div className="min-w-0 flex-1">
              <Bone className="h-[22px] w-[52%]" style={s} />
              <Bone className="mt-[5px] h-[14px] w-[36%]" style={s} />
              <div className="mt-[11px] flex flex-wrap items-center gap-[9px]">
                <Bone className="h-[22px] w-[88px] rounded-full" style={s} />
                <Bone className="h-[14px] w-[170px]" style={s} />
              </div>
            </div>
            <div className="flex shrink-0 gap-[7px] max-md:w-full">
              <Bone className="h-[58px] w-[66px] rounded-[10px]" style={s} />
              <Bone className="h-[58px] w-[66px] rounded-[10px]" style={s} />
            </div>
          </div>

          {/* mid: act pill + decision-makers */}
          <div className="mt-[15px] flex items-center gap-[12px] border-t border-line pt-[14px] max-md:flex-col max-md:items-start">
            <Bone className="h-[28px] w-[94px] rounded-full" style={s} />
            <div className="flex flex-1 flex-wrap gap-[7px]">
              <Bone className="h-[24px] w-[148px] rounded-[7px]" style={s} />
              <Bone className="h-[24px] w-[112px] rounded-[7px]" style={s} />
              <Bone className="mt-[6px] h-[14px] w-[240px]" style={{ ...s, flexBasis: "100%" }} />
            </div>
          </div>

          {/* actions row */}
          <div className="mt-[15px] flex flex-wrap gap-[9px] border-t border-line pt-[14px]">
            <Bone className="h-[38px] w-[148px] rounded-[9px]" style={s} />
            <Bone className="h-[38px] w-[118px] rounded-[9px]" style={s} />
            <Bone className="h-[38px] w-[138px] rounded-[9px]" style={s} />
            <Bone className="h-[38px] w-[108px] rounded-[9px]" style={s} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      {/* TopBar */}
      <div className="sticky top-0 z-40 flex h-[58px] items-center justify-between border-b border-line bg-black/80 px-[26px] backdrop-blur-[14px]">
        <div className="flex items-center gap-[16px]">
          <div className="flex items-center gap-[9px]">
            <Bone className="h-[26px] w-[26px] rounded-full" />
            <Bone className="h-[15px] w-[66px]" />
            <Bone className="h-[12px] w-[130px]" />
          </div>
          <Bone className="h-[34px] w-[128px] rounded-[9px]" />
        </div>
        <div className="flex items-center gap-[12px]">
          <Bone className="h-[30px] w-[124px] rounded-full" />
          <Bone className="h-[32px] w-[32px] rounded-full" />
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-center justify-center border-b border-line bg-white/[0.02] px-[26px] py-[9px]">
        <Bone className="h-[36px] w-[154px] rounded-[10px]" />
      </div>

      {/* Page body */}
      <div className="mx-auto max-w-[1180px] px-[26px] pb-[90px] pt-[30px]">
        {/* Page header */}
        <div className="mb-[8px] flex items-end justify-between gap-[24px] max-md:flex-col max-md:items-start">
          <div className="flex flex-col gap-[7px]">
            <Bone className="h-[11px] w-[175px]" />
            <Bone className="h-[36px] w-[310px]" />
            <Bone className="mt-[2px] h-[13px] w-[380px] max-md:w-full" />
            <Bone className="h-[13px] w-[260px]" />
          </div>
          <div className="flex gap-[10px] max-md:w-full">
            <Bone className="h-[64px] w-[84px] rounded-[11px]" />
            <Bone className="h-[64px] w-[84px] rounded-[11px]" />
            <Bone className="h-[64px] w-[84px] rounded-[11px]" />
          </div>
        </div>

        {/* Section label + export */}
        <div className="mb-[16px] mt-[24px] flex items-center gap-[10px]">
          <Bone className="h-[11px] w-[150px]" />
          <div className="h-px flex-1 bg-line" />
          <Bone className="h-[34px] w-[110px] rounded-[9px]" />
        </div>

        {/* Signal card skeletons — staggered delays for a ripple feel */}
        <div className="flex flex-col gap-[14px]">
          <CardSkeleton delay={0} />
          <CardSkeleton delay={80} />
          <CardSkeleton delay={160} />
        </div>
      </div>
    </div>
  );
}
