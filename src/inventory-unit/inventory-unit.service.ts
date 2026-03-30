import { Injectable, OnModuleInit, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryUnit } from './entities/inventory-unit.entity';
import { CreateInventoryUnitDto, UpdateInventoryUnitDto } from './dto/inventory-unit.dto';

@Injectable()
export class InventoryUnitService implements OnModuleInit {
    constructor(
        @InjectRepository(InventoryUnit)
        private readonly unitRepo: Repository<InventoryUnit>,
    ) { }

    async onModuleInit() {
        // Seed default units if table is empty
        const count = await this.unitRepo.count();
        if (count === 0) {
            const defaults = [
                { symbol: "bottle", label: "Chai (bottle)" },
                { symbol: "box", label: "Hộp (box)" },
                { symbol: "can", label: "Lon (can)" },
                { symbol: "cup", label: "Chén/Cốc (cup)" },
                { symbol: "fl oz", label: "Ounce lỏng (fl oz)" },
                { symbol: "g", label: "Gam (g)" },
                { symbol: "kg", label: "Kilôgam (kg)" },
                { symbol: "l", label: "Lít (l)" },
                { symbol: "lb", label: "Pound (lb)" },
                { symbol: "ml", label: "Mililit (ml)" },
                { symbol: "oz", label: "Ounce (oz)" },
                { symbol: "pack", label: "Gói/Bao (pack)" },
                { symbol: "piece", label: "Cái/Quả/Miếng (pcs)" },
                { symbol: "slice", label: "Lát (slice)" },
                { symbol: "tbsp", label: "Muỗng canh (tbsp)" },
                { symbol: "tsp", label: "Muỗng cà phê (tsp)" },
            ];
            await this.unitRepo.save(defaults);
            console.log('✅ Default inventory units seeded!');
        }
    }

    async findAll() {
        return await this.unitRepo.find({ order: { label: 'ASC' } });
    }

    async findOne(id: string) {
        const unit = await this.unitRepo.findOne({ where: { id } });
        if (!unit) throw new NotFoundException('Đơn vị không tồn tại!');
        return unit;
    }

    async create(dto: CreateInventoryUnitDto) {
        const exists = await this.unitRepo.findOne({ where: { symbol: dto.symbol } });
        if (exists) throw new ConflictException('Ký hiệu đơn vị này đã tồn tại!');
        const unit = this.unitRepo.create(dto);
        return await this.unitRepo.save(unit);
    }

    async update(id: string, dto: UpdateInventoryUnitDto) {
        const unit = await this.findOne(id);
        Object.assign(unit, dto);
        return await this.unitRepo.save(unit);
    }

    async remove(id: string) {
        const unit = await this.findOne(id);
        await this.unitRepo.remove(unit);
        return { message: 'Đã xóa đơn vị thành công' };
    }
}
