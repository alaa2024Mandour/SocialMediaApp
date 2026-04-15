import crypto from "node:crypto"
import * as configService from "../../../config/config.service";

const ENCRYPTION_KEY = Buffer.from(configService.ENCRYPTION_KEY as string); 
const IV_LENGTH = configService.IV_LENGTH; 

export function encrypt(text:string) {
    if(!text){
        throw new Error("encrypted value is required");
    }
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);  

    let encrypted = cipher.update(text, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}


export function decrypt(text:string) {

    const [ivHex, encryptedText] = text.split(':');
    
    const iv = Buffer.from(ivHex!, 'hex');    

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY , iv);
    
    let decrypted = decipher.update(encryptedText!, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}
