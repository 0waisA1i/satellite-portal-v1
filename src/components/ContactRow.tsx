import type { VisibleContact } from "@/lib/types";
import { LockIcon } from "./icons";

// Decision-maker row. Until a contact is enriched the title is the headline
// and the name stays hidden (the title is what the server sent; there is no
// name to leak). Once enriched, the named contact and details are revealed.
export default function ContactRow({ contact }: { contact: VisibleContact }) {
  if (!contact.enriched || !contact.name) {
    return (
      <div className="flex items-center gap-[10px] border-t border-line py-[7px] first:border-t-0">
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-line-2 bg-white/[0.03] text-txt-4">
          <LockIcon className="h-[12px] w-[12px]" />
        </span>
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold leading-tight">
            {contact.title}
          </div>
          <div className="text-[10px] text-txt-4">
            Name revealed once enriched
          </div>
        </div>
      </div>
    );
  }

  const initials = contact.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div className="flex items-center gap-[10px] border-t border-line py-[7px] first:border-t-0">
      <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-line-2 bg-gradient-to-br from-[#222] to-[#0d0d0d] text-[9px] font-bold text-txt-2">
        {initials}
      </span>
      <div>
        <div className="text-[12.5px] font-semibold">{contact.name}</div>
        <div className="text-[10.5px] text-txt-3">{contact.title}</div>
      </div>
      <div className="ml-auto flex items-center gap-[8px]">
        <span className="font-mono text-[9px] text-txt-3">{contact.email}</span>
        {contact.linkedin_url && (
          <a
            className="text-[9px] font-bold tracking-[0.06em] text-cyan"
            href={contact.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            IN↗
          </a>
        )}
      </div>
    </div>
  );
}
