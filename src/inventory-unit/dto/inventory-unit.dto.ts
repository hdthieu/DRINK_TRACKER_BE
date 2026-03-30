import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateInventoryUnitDto {
    @IsNotEmpty()
    @IsString()
    symbol: string;

    @IsNotEmpty()
    @IsString()
    label: string;
}

export class UpdateInventoryUnitDto {
    @IsOptional()
    @IsString()
    symbol?: string;

    @IsOptional()
    @IsString()
    label?: string;
}
