import {hashSync,compareSync} from "bcrypt"

export function Hash(
    {
        plainText,
        saltRounds=12
    }:
    {
        plainText:string,
        saltRounds?:number
    }) : string  {
    return hashSync(String(plainText),Number(saltRounds))
}

export function Compare({
    plainText,
    cipherText
}:{
    plainText:string,
    cipherText:string
}) : boolean {
    return compareSync(plainText,cipherText)
}