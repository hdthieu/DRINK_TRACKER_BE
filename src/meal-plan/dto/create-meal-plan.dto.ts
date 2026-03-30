import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MealType, DayOfWeek } from 'src/common/enums';

export class CreateMealIngredientDto {
    @IsString()
    inventoryItemId: string;

    @IsNumber()
    amountInBaseUnit: number;

    @IsString()
    unitSymbol: string;
}

export class CreateMealPlanDto {
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @IsEnum(MealType)
    mealType: MealType;

    @IsString()
    mealName: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMealIngredientDto)
    ingredients: CreateMealIngredientDto[];
}
