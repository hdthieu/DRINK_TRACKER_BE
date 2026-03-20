import { Module } from '@nestjs/common';
import { HomeReceiptService } from './home-receipt.service';
import { HomeReceiptController } from './home-receipt.controller';

@Module({
  controllers: [HomeReceiptController],
  providers: [HomeReceiptService],
})
export class HomeReceiptModule {}
