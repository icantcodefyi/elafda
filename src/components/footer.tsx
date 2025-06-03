import { Architects_Daughter } from "next/font/google";

const architectsDaughter = Architects_Daughter({
  subsets: ["latin"],
  weight: ["400"],
});

export function Footer() {
  return (
    <div className={`${architectsDaughter.className} text-muted-foreground py-2 text-sm underline w-full flex items-center justify-center gap-2`}>
      <a
        href="https://x.com/icantcodefyi/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        by tulip
      </a>
          <div className="text-sm text-muted-foreground py-2 underline">
            <a
              href="https://github.com/sponsors/icantcodefyi/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              donate me
            </a>
          </div>
    </div>
  );
}
