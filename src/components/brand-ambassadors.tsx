import { Avatar, AvatarImage } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function BrandAmbassadors() {
  return (
    <div className="flex items-center">
      <div className="text-muted-foreground mr-1 text-xs font-medium">
        ambassadors
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://x.com/icantcodefyi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Avatar className="cursor-pointer transition-transform hover:scale-105 hover:rotate-12">
              <AvatarImage src="https://pbs.twimg.com/profile_images/1937347280090116097/MazYQ7vz_400x400.jpg" />
            </Avatar>
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>@icantcodefyi</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
