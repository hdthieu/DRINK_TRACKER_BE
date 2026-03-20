import { Controller } from '@nestjs/common';
import { HomeReceiptService } from './home-receipt.service';

@Controller('home-receipt')
export class HomeReceiptController {
  constructor(private readonly homeReceiptService: HomeReceiptService) {}
}
