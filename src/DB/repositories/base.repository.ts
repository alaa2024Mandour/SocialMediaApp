import {PopulateOptions, QueryFilter, QueryOptions } from "mongoose";
import { Types } from "mongoose";
import { ProjectionType } from "mongoose";
import { HydratedDocument, Model } from "mongoose";

export abstract class BaseRepository<TDocument> {
    constructor(protected readonly model: Model<TDocument>) { }

    async create(data: Partial<TDocument>): Promise<HydratedDocument<TDocument>> {
        return this.model.create(data);
    }

    async findById(
        {
            id,
            projection,
            options
        }:
            {
                id: Types.ObjectId,
                projection?: ProjectionType<TDocument>,
                options?: QueryOptions<TDocument>
            }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findById(id, projection, options)
    }

    async findOne(
        {
            filter,
            projection,
            options
        }:
            {
                filter: any,
                projection?: ProjectionType<TDocument>,
                options?: QueryOptions<TDocument>
            }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOne(filter, projection, options)
    }

    async findByIdAndUpdate(
        {
            id,
            updateData,
            projection,
            options
        }:
            {
                id: Types.ObjectId,
                updateData: Partial<TDocument>,
                projection?: ProjectionType<TDocument>,
                options?: QueryOptions<TDocument>
            }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true, ...options })
    }

    async findOneAndUpdate(
        {
            filter,
            updateData,
            projection,
            options
        }:
            {
                filter: any,
                updateData: Partial<TDocument>,
                projection?: ProjectionType<TDocument>,
                options?: QueryOptions<TDocument>
            }): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOneAndUpdate(filter, updateData, { new: true, runValidators: true, ...options })
    }

    async find(
        {
            filter,
            projection,
            options
        }:
            {
                filter: any,
                projection?: ProjectionType<TDocument>,
                options?: QueryOptions<TDocument>
            }): Promise<HydratedDocument<TDocument>[] | []> {
        return this.model.find(filter, projection, options)
            .select(options?.select)
            .sort(options?.sort)
            .skip(options?.skip!)
            .limit(options?.limit!)
            .populate(options?.populate as PopulateOptions)
    }


    async paginate<T>(
        {
            page,
            limit,
            search,
            populate,
            sort
        }:
            {
                page?: number,
                limit?: number,
                search?: QueryFilter<T>,
                populate?: any,
                sort?: any
            }
    ) {
        page = +page! || 1
        limit = +limit! || 1

        if (page < 1) page = 1
        if (limit < 1) limit = 2

        const skip = (page - 1) * limit

        const [data, totalDoc] = await Promise.all([
            await this.model.find({ ...(search ?? {}) }).limit(limit).skip(skip).sort(sort).populate(populate).exec(),

            await this.model.countDocuments({ ...(search ?? {}) })
        ])

        const totalPages = Math.ceil(totalDoc / limit)
        return {
            meta: {
                currentPage: page,
                totalPages,
                totalDoc,
                limit,
            },
            data
        }
    }
}