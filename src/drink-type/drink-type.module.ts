import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrinkType } from './entities/drink-type.entity';
import { DrinkTypeService } from './drink-type.service';
import { DrinkTypeController } from './drink-type.controller';
import { S3Service } from '../common/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([DrinkType])],
  controllers: [DrinkTypeController],
  providers: [DrinkTypeService, S3Service],
})
export class DrinkTypeModule { }
