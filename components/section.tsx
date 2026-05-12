import { cn } from "@/lib/utils";

type SectionProps = React.PropsWithChildren<{
  size?: number | "auto";
  layout?: keyof typeof layouts;
}>;

export function Section({ size, children, layout }: SectionProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col justify-center items-center",
        layout && layouts[layout],
      )}
      style={{
        height: typeof size === "number" ? `${size}vh` : undefined,
      }}
    >
      {children}
    </div>
  );
}

const layouts = {
  default: "",
  columns: "grid grid-cols-2 w-fit mx-auto",
};
