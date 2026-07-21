import { notFound } from "next/navigation";
import { getCollection, type CollectionType } from "@/lib/admin/collections";
import { listCollection } from "@/lib/repository/content-repository";
import CollectionManager from "@/components/admin/CollectionManager";

export const dynamic = "force-dynamic";

export default async function CollectionPage(
  props: {
    params: Promise<{ type: string }>;
  }
) {
  const params = await props.params;
  const def = getCollection(params.type);
  if (!def) notFound();

  const items = (await listCollection(def.key)) as unknown as Record<string, unknown>[];

  return (
    <CollectionManager
      type={params.type as CollectionType}
      initialItems={items}
    />
  );
}
