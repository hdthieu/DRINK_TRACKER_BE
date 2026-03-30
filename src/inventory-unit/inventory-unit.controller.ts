import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryUnitService } from './inventory-unit.service';
import { CreateInventoryUnitDto, UpdateInventoryUnitDto } from './dto/inventory-unit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory-unit')
export class InventoryUnitController {
    constructor(private readonly service: InventoryUnitService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateInventoryUnitDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateInventoryUnitDto) {
        return this.service.update(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
