import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drinklog } from './entities/drinklog.entity';
import { User } from '../user/entities/user.entity';
import { CreateDrinklogDto } from './dto/create-drinklog.dto';
import { UpdateDrinklogDto } from './dto/update-drinklog.dto';
import { S3Service } from '../common/s3.service';
import { DrinkType } from '../drink-type/entities/drink-type.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class DrinklogService {
  constructor(
    @InjectRepository(Drinklog)
    private drinklogRepository: Repository<Drinklog>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(DrinkType)
    private drinkTypeRepository: Repository<DrinkType>,

    private s3Service: S3Service,
  ) { }

  // ── Thêm đồ uống mới ─────────────────────────────────────
  async create(userId: string, dto: CreateDrinklogDto): Promise<Drinklog> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const { drinkTypeId, ...restDto } = dto;

    const logData: DeepPartial<Drinklog> = {
      ...restDto,
      rating: dto.rating ?? 5,
      acidity: dto.acidity ?? 0,
      bitterness: dto.bitterness ?? 0,
      body: dto.body ?? 0,
      isHomeMade: dto.isHomeMade ?? false,
      user: { id: userId },
    };

    const log: Drinklog = this.drinklogRepository.create(logData);

    if (drinkTypeId) {
      const type = await this.drinkTypeRepository.findOne({ where: { id: drinkTypeId } });
      if (type) log.drinkType = type;
    }

    return await this.drinklogRepository.save(log);
  }

  async uploadImage(file: Express.Multer.File): Promise<{ imageUrl: string }> {
    const imageUrl = await this.s3Service.uploadFile(file, 'drinklogs');
    return { imageUrl };
  }

  // ── Lấy tất cả log của user hiện tại ──
  async findAllByUser(userId: string): Promise<Drinklog[]> {
    return await this.drinklogRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Lấy log hôm nay của user ──
  async findTodayByUser(userId: string): Promise<Drinklog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return await this.drinklogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt >= :today', { today })
      .andWhere('log.createdAt < :tomorrow', { tomorrow })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }

  // ── Lấy chi tiết 1 log ──
  async findOne(userId: string, id: string): Promise<Drinklog> {
    const log = await this.drinklogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!log) throw new NotFoundException('Không tìm thấy bản ghi đồ uống');
    if (log.user.id !== userId)
      throw new ForbiddenException('Bạn không có quyền xem bản ghi này');
    return log;
  }

  // ── Cập nhật log ──
  async update(
    userId: string,
    id: string,
    dto: UpdateDrinklogDto,
  ): Promise<Drinklog> {
    const log = await this.findOne(userId, id);
    Object.assign(log, dto);
    return await this.drinklogRepository.save(log);
  }

  // // ── Xoá log ───────────────────────────────────────────────
  // async remove(userId: string, id: string): Promise<{ message: string }> {
  //   const log = await this.findOne(userId, id); // throws if not found / forbidden
  //   await this.drinklogRepository.remove(log);
  //   return { message: 'Đã xoá bản ghi thành công 🌸' };
  // }
}
