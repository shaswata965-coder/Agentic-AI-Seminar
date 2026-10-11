import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { COLLECTION_MAP, COLLECTIONS } from "@/lib/schema/resources";

type Params = PageProps<"/admin/content/[resource]">["params"];

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ resource: c.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { resource } = await params;
  return { title: COLLECTION_MAP[resource]?.label ?? "Content" };
}

export default function ContentPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="card p-10 text-center text-muted">Loading…</div>}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Params }) {
  const { resource } = await params;
  if (!COLLECTION_MAP[resource]) notFound();
  return <ResourceManager key={resource} resourceKey={resource} />;
}
