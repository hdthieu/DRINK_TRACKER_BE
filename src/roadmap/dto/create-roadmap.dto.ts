import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ActivityType } from '../../common/enums';

export class CreateRoadmapDto {
    @IsString()
    @IsNotEmpty({ message: 'Thời gian không được để trống' })
    time: string; // "HH:mm"

    @IsString()
    @IsNotEmpty({ message: 'Tên hoạt động không được để trống' })
    activityName: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ActivityType, { message: 'Loại hoạt động không hợp lệ' })
    @IsOptional()
    activityType?: ActivityType;

    @IsUUID('4', { message: 'ID bữa ăn không hợp lệ' })
    @IsOptional()
    mealPlanId?: string;

    @IsString()
    @IsNotEmpty({ message: 'Ngày thực hiện không được để trống' })
    date: string;
}
