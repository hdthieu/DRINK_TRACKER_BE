import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodInventory } from './entities/food-inventory.entity';
import { CreateFoodInventoryDto } from './dto/create-food-inventory.dto';
import { UpdateFoodInventoryDto } from './dto/update-food-inventory.dto';

@Injectable()
export class FoodInventoryService {
    constructor(
        @InjectRepository(FoodInventory)
        private readonly repository: Repository<FoodInventory>,
    ) { }

    async create(userId: string, dto: CreateFoodInventoryDto) {
        const item = this.repository.create({
            ...dto,
            user: { id: userId }
        });
        return await this.repository.save(item);
    }

    async findAll(userId: string) {
        return await this.repository.find({
            where: { user: { id: userId } },
            order: { itemName: 'ASC' }
        });
    }

    async findOne(id: string, userId: string) {
        const item = await this.repository.findOne({ where: { id, user: { id: userId } } });
        if (!item) throw new NotFoundException('Dư liệu kho không tồn tại!');
        return item;
    }

    async update(id: string, userId: string, dto: UpdateFoodInventoryDto) {
        const item = await this.findOne(id, userId);
        Object.assign(item, dto);
        return await this.repository.save(item);
    }

    async remove(id: string, userId: string) {
        const item = await this.findOne(id, userId);
        await this.repository.remove(item);
        return { message: 'Đã xóa mục trong kho thành công' };
    }
}
