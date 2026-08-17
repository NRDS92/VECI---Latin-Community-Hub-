import {
    ContentPublishedEvent,
} from "./content-published.event";

export type PublicContentEvent =
    ContentPublishedEvent;


type EventHandler<T> =
    (event: T) => Promise<void> | void;


const handlers: Array<
    EventHandler<PublicContentEvent>
> = [];


/**
 * Subscribe to public content events.
 */
export const subscribe = (
    handler: EventHandler<PublicContentEvent>
) => {

    handlers.push(handler);

};


/**
 * Publish a public content event.
 */
export const publishEvent = async (
    event: PublicContentEvent
) => {

    await Promise.all(
        handlers.map(
            (handler) => handler(event)
        )
    );

};