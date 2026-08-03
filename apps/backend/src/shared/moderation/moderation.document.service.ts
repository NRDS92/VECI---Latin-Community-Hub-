import mongoose, { Model } from "mongoose";

import { AppError } from "../errors/AppError";

export const findDocumentOrFail = async <T>(
    model: Model<T>,
    id: string,
    entityName = "Document"
) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(
            `Invalid ${entityName.toLowerCase()} id`,
            400,
            "INVALID_ID"
        );
    }

    const document = await model.findById(id);

    if (!document) {
        throw new AppError(
            `${entityName} not found`,
            404,
            "NOT_FOUND"
        );
    }

    return document;
};