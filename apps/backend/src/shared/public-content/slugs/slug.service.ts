/**
 * Public Content Platform
 *
 * SlugService
 *
 * Responsible for generating normalized,
 * URL-friendly slug candidates.
 *
 * This service does not access the database.
 * Uniqueness is handled by the persistence layer.
 */

export class SlugService {

    /**
     * Normalize a string into a URL-safe slug.
     */
    static normalize(value: string): string {

        if (!value) {
            return "";
        }

        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    }


    /**
     * Generate a basic slug from a value.
     *
     * Example:
     *
     * "Salsa Night"
     *
     * → "salsa-night"
     */
    static generate(value: string): string {

        return this.normalize(value);
    }


    /**
     * Generate a slug using semantic context.
     *
     * Example:
     *
     * value:   "Salsa Night"
     * context: "Cologne"
     *
     * → "salsa-night-cologne"
     */
    static generateWithContext(
        value: string,
        context?: string
    ): string {

        const baseSlug =
            this.normalize(value);

        if (!context) {
            return baseSlug;
        }

        const contextSlug =
            this.normalize(context);

        if (!contextSlug) {
            return baseSlug;
        }

        if (
            baseSlug.endsWith(
                `-${contextSlug}`
            )
        ) {
            return baseSlug;
        }

        return `${baseSlug}-${contextSlug}`;
    }


    /**
     * Generate a deterministic fallback slug
     * using a stable identifier.
     *
     * Example:
     *
     * value:      "Salsa Night"
     * identifier: "65a91fabc123"
     *
     * → "salsa-night-abc123"
     *
     * The identifier is intentionally shortened
     * to keep the URL reasonably readable.
     */
    static generateWithIdentifier(
        value: string,
        identifier: string
    ): string {

        const baseSlug =
            this.normalize(value);

        if (!identifier) {
            return baseSlug;
        }

        const normalizedIdentifier =
            identifier
                .toString()
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

        if (!normalizedIdentifier) {
            return baseSlug;
        }

        const shortIdentifier =
            normalizedIdentifier.slice(-6);

        if (!baseSlug) {
            return shortIdentifier;
        }

        return `${baseSlug}-${shortIdentifier}`;
    }

}