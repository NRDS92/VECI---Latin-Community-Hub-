import type {
    SitemapEntry,
} from "./sitemap.service";


const SITEMAP_NAMESPACE =
    "http://www.sitemaps.org/schemas/sitemap/0.9";


/**
 * Escape characters that have special meaning
 * inside XML.
 */
const escapeXml = (
    value: string
): string => {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
};


/**
 * Format a date according to the XML sitemap
 * lastmod specification.
 */
const formatLastModified = (
    date: Date
): string => {

    return date.toISOString();
};


/**
 * Convert sitemap entries into a valid XML sitemap.
 */
export const generateSitemapXml = (
    entries: SitemapEntry[]
): string => {

    const urls =
        entries
            .map(
                (entry) => {

                    const lastModified =
                        entry.lastModified
                            ? `
        <lastmod>${formatLastModified(
            entry.lastModified
        )}</lastmod>`
                            : "";

                    const priority =
                        entry.priority !== undefined
                            ? `
        <priority>${entry.priority.toFixed(
                                1
                            )}</priority>`
                            : "";

                    const changeFrequency =
                        entry.changeFrequency
                            ? `
        <changefreq>${entry.changeFrequency}</changefreq>`
                            : "";

                    return `
    <url>
        <loc>${escapeXml(entry.url)}</loc>${lastModified}${changeFrequency}${priority}
    </url>`;
                }
            )
            .join("");


    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="${SITEMAP_NAMESPACE}">${urls}
</urlset>`;
};