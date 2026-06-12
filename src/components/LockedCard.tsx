import { LockIcon } from "./icons";
import { btnAccent } from "./SignalCard";

// Production rule: locked rows never reach the browser, so the blurred layer
// is a generic skeleton, not real signal content. Only the count is real.
export default function LockedCard({
  lockedCount,
  onUpgrade,
}: {
  lockedCount: number;
  onUpgrade: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-panel">
      <div
        className="pointer-events-none flex select-none items-stretch opacity-55 blur-[6px]"
        aria-hidden
      >
        <div className="flex shrink-0 basis-[152px] flex-col justify-between gap-[18px] border-l-[3px] border-l-white/20 border-r border-r-line bg-white/[0.02] p-[16px] pt-[18px]">
          <div className="h-[14px] w-[90px] rounded bg-white/25" />
          <div>
            <div className="h-[8px] w-[70px] rounded bg-white/15" />
            <div className="mt-[10px] h-[6px] w-full rounded-full bg-white/10">
              <div className="h-full w-4/5 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 p-[22px] pt-[18px]">
          <div className="h-[20px] w-[240px] rounded bg-white/25" />
          <div className="mt-[8px] h-[12px] w-[180px] rounded bg-white/15" />
          <div className="mt-[16px] h-[24px] w-[320px] rounded-full bg-white/10" />
          <div className="mt-[18px] border-t border-line pt-[14px]">
            <div className="h-[12px] w-[420px] max-w-full rounded bg-white/12" />
            <div className="mt-[8px] h-[12px] w-[360px] max-w-full rounded bg-white/8" />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-[11px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.35),rgba(0,0,0,.72))]">
        <LockIcon className="h-[34px] w-[34px] text-accent opacity-85" />
        <div className="text-[14px] font-semibold">
          {lockedCount} more qualified signal{lockedCount !== 1 ? "s" : ""} this
          period
        </div>
        <div className="max-w-[300px] text-center text-[11.5px] leading-[1.45] text-txt-3">
          Signal Feed surfaces up to 5 archetypes per month. Unlock unlimited
          confirmed signals with Signal Stack.
        </div>
        <button className={`${btnAccent} mt-[3px]`} onClick={onUpgrade}>
          Upgrade to Signal Stack →
        </button>
      </div>
    </div>
  );
}
