import { cn } from "@/lib/utils";
import Image from "next/image";

type PhotoProps = {
  src: string;
};

export function Photo({ src }: PhotoProps) {
  return (
    <div
      className={cn(
        "flex max-w-screen md:max-w-[1000px] max-h-screen md:max-h-[70vh] m-2 my-[10vh]",
      )}
    >
      <Image
        width={1000}
        height={1000}
        src={src}
        alt="Photo"
        // className={cn("max-w-md")}
        className="object-contain"
      />
    </div>
  );
}
