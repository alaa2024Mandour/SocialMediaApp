import { PopulateOption, PopulateOptions, QueryOptions } from "mongoose";
import { Types } from "mongoose";
import { ProjectionType } from "mongoose";
import { HydratedDocument, Model } from "mongoose";

export class BaseRepository<TDocument> {
    constructor(protected readonly model : Model<TDocument>){}

    async create(data : Partial<TDocument>):Promise<HydratedDocument<TDocument>>{
        return this.model.create(data);
    }

    async findById(
        {
            id,
            projection,
            options
        }:
        {
            id: Types.ObjectId ,
            projection?: ProjectionType<TDocument>,
            options?: QueryOptions<TDocument> 
        }):Promise<HydratedDocument<TDocument> | null>{
        return this.model.findById(id,projection,options)
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
        }):Promise<HydratedDocument<TDocument> | null>{
        return this.model.findOne(filter,projection,options)
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
        }):Promise<HydratedDocument<TDocument> | null>{
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
        }):Promise<HydratedDocument<TDocument> | null>{
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
        }):Promise<HydratedDocument<TDocument>[] | []>{
        return this.model.find(filter,projection,options)
        .select(options?.select)
        .sort(options?.sort)
        .skip(options?.skip!)
        .limit(options?.limit!)
        .populate(options?.populate as PopulateOptions )
        }
        
    }