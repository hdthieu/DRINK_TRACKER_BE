import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roadmap')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
    constructor(private readonly roadmapService: RoadmapService) { }

    @Post()
    create(@Request() req, @Body() createRoadmapDto: CreateRoadmapDto) {
        return this.roadmapService.create(req.user.sub, createRoadmapDto);
    }

    @Get('my-roadmap')
    findByDate(@Request() req, @Query('date') date: string) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.roadmapService.findByDate(req.user.sub, targetDate);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateRoadmapDto: UpdateRoadmapDto) {
        return this.roadmapService.update(req.user.sub, id, updateRoadmapDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.roadmapService.remove(req.user.sub, id);
    }

    @Post('seed-template')
    seedTemplate(@Request() req) {
        return this.roadmapService.seedTemplate(req.user.sub);
    }
}
