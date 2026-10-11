import "server-only";
import { revalidateTag } from "next/cache";

/** Expire cached content immediately so the next visitor sees the change. */
export function expireTags(tags: string[]) {
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
}
