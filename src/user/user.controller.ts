import { Controller, Get, UseGuards, Request, Patch, Body, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get("/my-profile")
  async myProfile(@Request() req) {
    const userId = req.user.sub;
    return this.userService.myProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  async update(@Request() req, @Body() updateDto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.userService.update(userId, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    return this.userService.uploadAvatar(userId, file);
  }
}
