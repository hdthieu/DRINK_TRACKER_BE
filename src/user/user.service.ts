import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { S3Service } from '../common/s3.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private s3Service: S3Service,
  ) { }

  async myProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User không tồn tại!');
      const baseWeight = user.weight || 60;
      const recommendedGoal = Math.round(baseWeight * 35);

      return {
        ...user,
        dailyWaterGoal: user.dailyWaterGoal || recommendedGoal,
        recommendedWaterGoal: recommendedGoal,
      };
    } catch (error) {
      console.error('Error in myProfile service:', error);
      throw error;
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại!');

    const imageUrl = await this.s3Service.uploadFile(file);
    user.imageUrl = imageUrl;
    return await this.userRepository.save(user);
  }

  async update(userId: string, updateDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại!');

    // Cập nhật thông tin mới một cách nhẹ nhàng nhàng
    Object.assign(user, updateDto);
    return await this.userRepository.save(user);
  }
}
