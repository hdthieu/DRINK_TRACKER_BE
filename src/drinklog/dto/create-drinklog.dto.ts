import {
    IsString,
    IsNotEmpty,
    IsInt,
    IsNumber,
    IsOptional,
    Min,
    Max,
    IsBoolean,
    IsEnum,
} from 'class-validator';
import { DrinkSize, DrinkTemperature } from 'src/common/enums';

export class CreateDrinklogDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên đồ uống không được để trống' })
    drinkName: string;

    @IsInt()
    @Min(0, { message: 'Caffeine không thể âm' })
    caffeineMg: number;

    @IsInt()
    @Min(0, { message: 'Đường không thể âm' })
    sugarG: number;

    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Dung tích không thể âm' })
    volumeMl?: number;

    @IsInt()
    @Min(0, { message: 'Calories không thể âm' })
    calories: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'Giá không thể âm' })
    price: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    acidity?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    bitterness?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    body?: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsBoolean()
    isHomeMade?: boolean;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsEnum(DrinkSize, { message: 'Kích cỡ không hợp lệ' })
    size?: DrinkSize;

    @IsOptional()
    @IsEnum(DrinkTemperature, { message: 'Nhiệt độ không hợp lệ' })
    temperature?: DrinkTemperature;

    @IsOptional()
    @IsString()
    drinkTypeId?: string;
}
