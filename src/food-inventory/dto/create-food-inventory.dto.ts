import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateFoodInventoryDto {
    @IsString()
    itemName: string;

    @IsNumber()
    @Min(0)
    quantityInBaseUnit: number;

    @IsString()
    baseUnitSymbol: string;

    @IsString()
    @IsOptional()
    displayUnitSymbol?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    lowStockThreshold?: number;
}
