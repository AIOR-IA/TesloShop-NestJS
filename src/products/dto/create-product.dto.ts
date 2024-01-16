import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title:string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?:number;

    @IsString()
    @IsOptional()
    description?:string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsOptional()
    stock?: number;

    //each true, each value inside the array sshould be a string
    @IsString({ each: true})
    @IsArray()
    sizes: string[];

    //is like a type
    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @IsString({ each: true})
    @IsArray()
    @IsOptional()
    tags:string[]
}
