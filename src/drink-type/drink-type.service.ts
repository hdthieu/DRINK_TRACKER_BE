import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDrinkTypeDto } from './dto/create-drink-type.dto';
import { UpdateDrinkTypeDto } from './dto/update-drink-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DrinkType } from './entities/drink-type.entity';
import { Repository } from 'typeorm';
import { S3Service } from '../common/s3.service';

@Injectable()
export class DrinkTypeService {
  constructor(
    @InjectRepository(DrinkType)
    private drinkTypeRepository: Repository<DrinkType>,
    private s3Service: S3Service,
  ) { }

  async uploadImage(file: Express.Multer.File) {
    const imageUrl = await this.s3Service.uploadFile(file, 'drink-types');
    return { imageUrl };
  }

  async create(createDrinkTypeDto: CreateDrinkTypeDto) {
    const type = this.drinkTypeRepository.create(createDrinkTypeDto);
    return await this.drinkTypeRepository.save(type);
  }

  async findAll() {
    return await this.drinkTypeRepository.find();
  }

  async findOne(id: string) {
    const type = await this.drinkTypeRepository.findOne({ where: { id } });
    if (!type) throw new NotFoundException('Không tìm thấy loại đồ uống');
    return type;
  }

  async update(id: string, updateDrinkTypeDto: UpdateDrinkTypeDto) {
    const type = await this.findOne(id);
    Object.assign(type, updateDrinkTypeDto);
    return await this.drinkTypeRepository.save(type);
  }

  async remove(id: string) {
    const type = await this.findOne(id);
    await this.drinkTypeRepository.remove(type);
    return { success: true };
  }
}
