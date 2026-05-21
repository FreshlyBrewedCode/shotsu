import { cn } from "@/lib/utils";

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
      <img
        src={src}
        alt="Photo"
        className="object-contain"
      />
    </div>
  );
}
