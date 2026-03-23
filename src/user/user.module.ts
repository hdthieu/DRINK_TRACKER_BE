import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { S3Service } from '../common/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, S3Service],
  exports: [UserService], // Xuất ra để AuthModule cũng có thể dùng
})
export class UserModule { }
