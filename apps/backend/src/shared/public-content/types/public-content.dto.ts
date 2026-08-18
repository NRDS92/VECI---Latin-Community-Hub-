export interface PublicEventDTO {
    id: string;

    slug: string;

    title: string;

    description?: string;

    category: string;

    eventType:
        | "official"
        | "community";

    cityId: string;

    address: string;

    dateStart: Date;

    dateEnd?: Date;

    image?: string;
}