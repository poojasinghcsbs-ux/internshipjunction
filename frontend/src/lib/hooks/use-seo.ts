import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  canonicalPath?: string;
};

const SITE_NAME = "InternshipJunction";
const SITE_URL = "https://internshipjunction.com";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSeo({ title, description, image, jsonLd, canonicalPath }: SeoOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;
    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
      upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    }
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "website");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    if (image) {
      upsertMeta('meta[property="og:image"]', "property", "og:image", image);
    }
    if (canonicalPath) {
      upsertMeta('meta[property="og:url"]', "property", "og:url", `${SITE_URL}${canonicalPath}`);
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `${SITE_URL}${canonicalPath}`);
    }

    const scriptId = "internshipjunction-page-jsonld";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, image, canonicalPath, jsonLd]);
}

export const seo = { siteName: SITE_NAME, siteUrl: SITE_URL };
