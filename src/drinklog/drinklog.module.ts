import { Module } from '@nestjs/common';
import { DrinklogService } from './drinklog.service';
import { DrinklogController } from './drinklog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drinklog } from './entities/drinklog.entity';
import { User } from '../user/entities/user.entity';
import { DrinkType } from '../drink-type/entities/drink-type.entity';
import { S3Service } from '../common/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Drinklog, User, DrinkType])],
  controllers: [DrinklogController],
  providers: [DrinklogService, S3Service],
  exports: [DrinklogService],
})
export class DrinklogModule { }
