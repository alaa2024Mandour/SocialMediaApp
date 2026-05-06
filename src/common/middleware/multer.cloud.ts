import multer from 'multer';
import { MimeEnum, StorageEnum } from '../enum/multer.enum';
import {tmpdir} from 'os';
import { file } from 'zod';
const multerCloud = ({
    storage_type=StorageEnum.memory,
    file_type=MimeEnum.images,
    maxFileSize=5 * 1024 * 1024 // 5MB
}:{
    storage_type:StorageEnum,
    file_type:string[],
    maxFileSize?:number
} ) => {
    const storage = storage_type === StorageEnum.memory ? multer.memoryStorage() 
    : multer.diskStorage({ 
        destination: tmpdir(),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' +  file.originalname);
        } 
    });

    function fileFilter (req:Express.Request, file:Express.Multer.File, cb:multer.FileFilterCallback) {
        if(!file_type.includes(file.mimetype)){
            return cb(new Error("Invalid file type"))
        }
        else{
            cb(null,true)
        }
    }
    const upload = multer({ storage, fileFilter, limits:{fileSize:maxFileSize} });

    return upload;
}

export default multerCloud;