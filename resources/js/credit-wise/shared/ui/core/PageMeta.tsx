import { useEffect } from "react";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  if (typeof document === "undefined") return;

  let node = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    node?.setAttribute(key, value);
  });
}

export function PageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = title;
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });

    if (description) {
      upsertMeta('meta[name="description"]', { name: "description", content: description });
      upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
      return;
    }

    document.head.querySelector('meta[name="description"]')?.remove();
    document.head.querySelector('meta[property="og:description"]')?.remove();
  }, [description, title]);

  return null;
}
