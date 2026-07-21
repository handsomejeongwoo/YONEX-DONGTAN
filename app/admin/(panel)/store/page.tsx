import { readContent } from "@/lib/repository/content-repository";
import StoreEditor from "@/components/admin/StoreEditor";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const c = await readContent();
  return <StoreEditor initial={c.store} />;
}
