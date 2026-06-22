"use client";

import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/actions";

export default function AvatarMenu({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-line-2 bg-gradient-to-br from-[#2a2a2a] to-[#111] text-[12px] font-bold text-txt-2 hover:border-line transition-colors cursor-pointer"
      >
        {code}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-line bg-[#111] py-1 shadow-xl shadow-black/60 z-50">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full px-3 py-2 text-left text-sm text-txt-2 hover:bg-panel-2 hover:text-foreground transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
