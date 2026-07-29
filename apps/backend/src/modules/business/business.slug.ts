import { Business } from "./business.model";
import { generateSlug } from "../../shared/utils/slug";

export const generateUniqueBusinessSlug = async (
  name: string
): Promise<string> => {
  const baseSlug = generateSlug(name);

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existingBusiness = await Business.exists({
      slug,
    });

    if (!existingBusiness) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};