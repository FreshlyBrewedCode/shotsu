import { Photo } from "@/components/photo";
import { Section } from "@/components/section";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen min-h-screen max-w-screen flex flex-col">
      <Section size={80}>
        <h1 className="text-5xl m-8 ">shotsu</h1>
        <h2 className="text-xl text-center">
          a minimalist and open photography platform
          <br /> where you own your photos
        </h2>
        <Link
          href="/me"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
        >
          get started
        </Link>
      </Section>
      <Section layout="default">
        <Photo src="/photos/69D3D7F6-81E9-4E1C-A9CF-F913CBEEA1DC.jpg" />
        <Photo src="/photos/6CE82D19-DDF6-4C88-9B0B-9A3B4AC7BC68.jpg" />
        <Photo src="/photos/DSCF3379.jpg" />
        <Photo src="/photos/7CA45CE4-E193-43E5-85E6-E8E830AF330B.jpg" />
        <Photo src="/photos/936C04A4-5817-4A2D-A3C6-BA755F6BFB4C.jpg" />
      </Section>
    </div>
  );
}
