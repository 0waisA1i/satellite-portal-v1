import { signOutAction } from "@/app/actions";

function Logo() {
  return (
    <svg viewBox="0 0 44 44" fill="none" className="h-[26px] w-[26px]">
      <g clipPath="url(#ac0)">
        <path
          d="M21.95 43.48C34.07 43.48 43.9 33.88 43.9 22.03 43.9 10.19 34.07.59 21.95.59 9.83.59.01 10.19.01 22.03.01 33.88 9.83 43.48 21.95 43.48Z"
          fill="#fff"
        />
        <path
          d="M32.16 12.82c2.04-1.33-24.78-2.25-19.95 15.95 1.55-3.27 4.16-4.98 6.2-7.24.36-.4-3.92 1.14-3.56.78 2.5-3.68 10.17-6.8 8.72-5.79-1.45 1.01-2.88 1.88-3.6 3.32-.65.77 3.55-.96 3.01-.36-3.45 1.91-6.79 7.68-7.42 12.43h1.4s8.12-.56 10.96-6.01c2.83-5.45 2.2-11.74 4.24-13.07Z"
          fill="#000"
        />
      </g>
      <defs>
        <clipPath id="ac0">
          <rect width="44" height="43" fill="#fff" transform="translate(0 .5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function AdminTopBar({
  clients,
  active,
}: {
  clients: { client_id: string }[];
  active: string | null;
}) {
  return (
    <div className="sticky top-0 z-40 flex h-[58px] items-center justify-between border-b border-line bg-black/80 px-[26px] backdrop-blur-[14px]">
      {/* Left: logo + agency */}
      <div className="flex items-center gap-[9px]">
        <Logo />
        <span className="text-[15px] font-bold tracking-[-0.01em]">
          Satellite
        </span>
        <span className="ml-[2px] border-l border-line-2 pl-[10px] text-[9px] font-semibold uppercase tracking-[0.14em] text-txt-3">
          Cleantech GrowthLab
        </span>
      </div>

      {/* Center: client pill tabs */}
      {clients.length > 0 && (
        <div className="flex gap-[2px] rounded-[10px] border border-line bg-panel p-[3px]">
          {clients.map((c) => (
            <a
              key={c.client_id}
              href={`?client=${c.client_id}`}
              className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold transition ${
                c.client_id === active
                  ? "bg-accent text-black"
                  : "text-txt-3 hover:text-foreground"
              }`}
            >
              {c.client_id}
            </a>
          ))}
        </div>
      )}

      {/* Right: admin label + sign out */}
      <div className="flex items-center gap-[12px]">
        <span className="rounded-full border border-line bg-panel px-[10px] py-[5px] text-[9.5px] font-semibold uppercase tracking-[0.08em] text-txt-3">
          Admin Portal
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex h-[32px] items-center justify-center rounded-full border border-line-2 bg-gradient-to-br from-[#2a2a2a] to-[#111] px-[13px] text-[11px] font-bold text-txt-2 transition-colors hover:border-line cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
