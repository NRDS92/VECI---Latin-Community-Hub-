import { Model } from "mongoose";
import { generateSlug } from "../utils/slug";

interface GenerateUniqueSlugParams<T> {
    model: Model<T>;
    value: string;
}

export const generateUniqueSlug = async <T>({
    model,
    value,
}: GenerateUniqueSlugParams<T>): Promise<string> => {
    const baseSlug = generateSlug(value);

    let slug = baseSlug;
    let counter = 2;

    while (true) {
        const exists = await model.exists({ slug });

        if (!exists) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};