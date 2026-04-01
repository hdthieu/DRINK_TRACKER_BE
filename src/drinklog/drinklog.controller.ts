import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DrinklogService } from './drinklog.service';
import { CreateDrinklogDto } from './dto/create-drinklog.dto';
import { UpdateDrinklogDto } from './dto/update-drinklog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('drink-log')
export class DrinklogController {
  constructor(private readonly drinklogService: DrinklogService) { }

  @Post()
  create(@Req() req, @Body() createDrinklogDto: CreateDrinklogDto) {
    const userId = req.user.sub;
    return this.drinklogService.create(userId, createDrinklogDto);
  }

  @Post('/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.drinklogService.uploadImage(file);
  }

  @Get()
  findAll(@Req() req) {
    const userId = req.user.sub;
    return this.drinklogService.findAllByUser(userId);
  }

  @Get('today')
  findToday(@Req() req) {
    const userId = req.user.sub;
    return this.drinklogService.findTodayByUser(userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.drinklogService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateDrinklogDto: UpdateDrinklogDto,
  ) {
    const userId = req.user.sub;
    return this.drinklogService.update(userId, id, updateDrinklogDto);
  }

  // @Delete(':id')
  // remove(@Req() req, @Param('id') id: string) {
  //   const userId = req.user.sub;
  //   return this.drinklogService.remove(userId, id);
  // }
}

