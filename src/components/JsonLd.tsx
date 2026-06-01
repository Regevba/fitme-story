// Server component that renders a schema.org JSON-LD object as a
// <script type="application/ld+json"> element. Per Next.js docs the
// canonical pattern for App Router JSON-LD injection uses
// dangerouslySetInnerHTML with a JSON.stringify'd payload
// (https://nextjs.org/docs/app/guides/json-ld).
//
// Safety: zero XSS risk in this component because (a) inputs come from
// typed helpers in src/lib/seo.ts (websiteJsonLd, organizationJsonLd,
// blogPostingJsonLd, breadcrumbJsonLd), never user input; (b) the
// payload is JSON.stringify'd — backslash + quote escapes are applied
// automatically; (c) the MIME type "application/ld+json" tells the
// browser to treat the body as JSON metadata, not as executable JS.
// Crawlers (Googlebot et al) parse the body for structured data only.
//
// Closes audit V-012's JSON-LD half (the seo.ts generators have existed
// since 2026-05-08 but were never wired into pages — the
// fitme-story-public-enhancements PR scope shipped the metadata half
// but left the JSON-LD half as a follow-on).

interface JsonLdProps {
  /** schema.org-shaped object from seo.ts helpers. */
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
