import mongoose from "mongoose";
import {
    CreateBusinessRequestSchema,
    UpdateBusinessRequestSchema,
    type CreateBusinessRequest,
    type UpdateBusinessRequest,
} from "@ndrs92/contracts";

import { Business } from "./business.model";

import { AppError } from "../../shared/errors/AppError";

import {
    validateBusinessCreation,
} from "./business.permissions";

import {
    generateUniqueSlug,
} from "../../shared/slug/slug.service";

import {
    buildBusiness,
} from "./business.builder";


// ======================================================
// CREATE BUSINESS
// ======================================================

export const createBusiness = async (
    data: CreateBusinessRequest,
    ownerId: string
) => {

    const validatedData =
        CreateBusinessRequestSchema.parse(data);

    // --------------------------------------------------
    // Check subscription / permissions
    // --------------------------------------------------

    await validateBusinessCreation(ownerId);


    // --------------------------------------------------
    // Generate public slug
    // --------------------------------------------------

    const slug = await generateUniqueSlug({
        model: Business,
        value: validatedData.name,
    });


    // --------------------------------------------------
    // Build business document
    // --------------------------------------------------

    const business = buildBusiness({
        data: validatedData,
        ownerId,
        slug,
    });


    // --------------------------------------------------
    // Persist
    // --------------------------------------------------

    await business.save();

    return business;
};


// ======================================================
// GET MY BUSINESSES
// ======================================================

export const getMyBusinesses = async (
    ownerId: string
) => {

    return Business
        .find({
            owner: ownerId,
        })
        .sort({
            createdAt: -1,
        });
};


// ======================================================
// GET BY ID
// ======================================================

export const getBusinessById = async (
    id: string
) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {

        throw new AppError(
            "Invalid business ID",
            400,
            "INVALID_ID"
        );
    }


    const business = await Business.findById(id);


    if (!business) {

        throw new AppError(
            "Business not found",
            404,
            "NOT_FOUND"
        );
    }


    return business;
};


// ======================================================
// UPDATE BUSINESS
// ======================================================

export const updateBusiness = async (
    id: string,
    ownerId: string,
    data: UpdateBusinessRequest
) => {

    // Validate at the service boundary so every caller receives the same
    // validation guarantees, before database reads or mutations occur.
    const validatedData = UpdateBusinessRequestSchema.parse(data);

    const business = await getBusinessById(id);


    // --------------------------------------------------
    // Ownership
    // --------------------------------------------------

    if (
        business.owner.toString() !== ownerId
    ) {

        throw new AppError(
            "Unauthorized",
            403,
            "FORBIDDEN"
        );
    }


    // --------------------------------------------------
    // Allowed fields
    // --------------------------------------------------

    const allowedFields: Array<
        keyof UpdateBusinessRequest
    > = [
        "name",
        "description",
        "providerType",
        "category",
        "subCategory",
        "priceRange",
        "profile",
        "images",
        "documents",
        "location",
        "contact",
        "community",
        "tags",
    ];


    // --------------------------------------------------
    // Apply only allowed fields
    // --------------------------------------------------

    for (const field of allowedFields) {

        if (validatedData[field] !== undefined) {

            (business as any)[field] =
                validatedData[field];
        }
    }


    // --------------------------------------------------
    // Slug
    // --------------------------------------------------

    /*
     * The slug is intentionally NOT regenerated
     * when the business name changes.
     *
     * This keeps public URLs stable.
     */


    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    await business.save();

    return business;
};


// ======================================================
// DELETE BUSINESS
// ======================================================

export const deleteBusiness = async (
    id: string,
    ownerId: string
) => {

    const business = await getBusinessById(id);


    // --------------------------------------------------
    // Ownership
    // --------------------------------------------------

    if (
        business.owner.toString() !== ownerId
    ) {

        throw new AppError(
            "Unauthorized",
            403,
            "FORBIDDEN"
        );
    }


    // --------------------------------------------------
    // Delete
    // --------------------------------------------------

    await business.deleteOne();
};
