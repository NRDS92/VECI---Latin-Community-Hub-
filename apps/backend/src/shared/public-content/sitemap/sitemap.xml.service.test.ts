
import {
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import {
    generateSitemapXml,
} from "./sitemap.xml.service";

describe(
    "Sitemap XML Service",
    () => {

        it(
            "should generate a valid sitemap XML",
            () => {

                const entries = [

                    {
                        url:
                            "https://veci-latin.com/events/salsa-night-cologne",

                        lastModified:
                            new Date(
                                "2026-08-17T10:00:00.000Z"
                            ),

                        priority:
                            0.8,

                        changeFrequency:
                            "daily" as const,
                    },

                ];


                const xml =
                    generateSitemapXml(
                        entries
                    );


                expect(xml).toContain(
                    '<?xml version="1.0" encoding="UTF-8"?>'
                );


                expect(xml).toContain(
                    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                );


                expect(xml).toContain(
                    "<loc>https://veci-latin.com/events/salsa-night-cologne</loc>"
                );


                expect(xml).toContain(
                    "<lastmod>2026-08-17T10:00:00.000Z</lastmod>"
                );


                expect(xml).toContain(
                    "<changefreq>daily</changefreq>"
                );


                expect(xml).toContain(
                    "<priority>0.8</priority>"
                );


                expect(xml).toContain(
                    "</urlset>"
                );

            }
        );


        it(
            "should escape XML special characters",
            () => {

                const entries = [

                    {
                        url:
                            "https://veci-latin.com/events/test?a=1&b=2",

                    },

                ];


                const xml =
                    generateSitemapXml(
                        entries
                    );


                expect(xml).toContain(
                    "test?a=1&amp;b=2"
                );

            }
        );


        it(
            "should generate an empty sitemap",
            () => {

                const xml =
                    generateSitemapXml(
                        []
                    );


                expect(xml).toContain(
                    "<urlset"
                );


                expect(xml).toContain(
                    "</urlset>"
                );


                expect(xml).not.toContain(
                    "<url>"
                );

            }
        );

    }
);