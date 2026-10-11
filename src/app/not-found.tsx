import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/layout/BrandMark";
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <header className="container-site flex h-16 items-center">
        <Link href="/" aria-label="Agentic AI Workshop 2026 — home">
          <BrandMark shortName="AAIW 2026" />
        </Link>
      </header>
      <main>
        <NotFoundContent />
      </main>
    </>
  );
}
