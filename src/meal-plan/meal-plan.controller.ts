import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meal-plan')
@UseGuards(JwtAuthGuard)
export class MealPlanController {
    constructor(private readonly mealPlanService: MealPlanService) { }

    @Post()
    create(@Request() req, @Body() createDto: CreateMealPlanDto) {
        return this.mealPlanService.create(req.user.sub, createDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.mealPlanService.findAll(req.user.sub);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.mealPlanService.findOne(id, req.user.sub);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.mealPlanService.remove(id, req.user.sub);
    }
}
