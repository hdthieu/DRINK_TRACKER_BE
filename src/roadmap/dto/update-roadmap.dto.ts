import { PartialType } from '@nestjs/mapped-types';
import { CreateRoadmapDto } from './create-roadmap.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRoadmapDto extends PartialType(CreateRoadmapDto) {
    @IsBoolean({ message: 'Trạng thái hoàn thành phải là kiểu boolean' })
    @IsOptional()
    isCompleted?: boolean;
}
