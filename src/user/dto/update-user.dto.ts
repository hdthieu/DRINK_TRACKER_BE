import { IsOptional, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Tên phải là một chuỗi ký tự' })
    name?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Cân nặng phải là con số' })
    @Min(5, { message: 'Cân nặng phải ít nhất 5kg' })
    @Max(500, { message: 'Cân nặng tối đa là 500kg' })
    weight?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Lượng Caffeine phải là con số' })
    @Min(0, { message: 'Lượng Caffeine không được nhỏ hơn 0' })
    @Max(5000, { message: 'Lượng Caffeine không được vượt quá 5000mg' })
    dailyCaffeineLimit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Lượng đường phải là con số' })
    @Min(0, { message: 'Lượng đường không được nhỏ hơn 0' })
    @Max(5000, { message: 'Lượng đường không được vượt quá 5000mg' })
    dailySugarLimit?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Tuổi phải là con số' })
    @Min(0)
    @Max(150)
    age?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Thời gian tập luyện phải là con số' })
    @Min(0)
    exerciseTimeMinutes?: number;

    @IsOptional()
    @IsBoolean()
    isHighTemperature?: boolean;
}
