import { Architects_Daughter } from "next/font/google";

const architectsDaughter = Architects_Daughter({
  subsets: ["latin"],
  weight: ["400"],
});

export function Footer() {
  return (
    <div
      className={`${architectsDaughter.className} text-muted-foreground flex w-full items-center justify-center gap-2 py-2 mb-5 text-sm`}
    >
      by
      <a
        href="https://x.com/icantcodefyi/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        icantcodefyi
      </a>{" "}
      and{" "}
      <a
        href="https://x.com/ramxcodes"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        ramx
      </a>
    </div>
  );
}
