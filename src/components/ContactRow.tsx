import type { Contact } from "@/lib/types";

export default function ContactRow({ contact }: { contact: Contact }) {
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
        <a
          className="text-[9px] font-bold tracking-[0.06em] text-cyan"
          href={contact.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          IN↗
        </a>
      </div>
    </div>
  );
}
