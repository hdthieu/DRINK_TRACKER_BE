import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { DrinkSize, DrinkTemperature } from '../../drinklog/enums/drinklog.enum';

export class CreateDrinkTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    caffeineMg?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    sugarG?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    calories?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    acidity?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    bitterness?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    body?: number;

    @IsEnum(DrinkTemperature)
    @IsOptional()
    defaultTemperature?: DrinkTemperature;
}
