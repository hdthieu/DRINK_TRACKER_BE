import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushSubscription } from './entities/push-subscription.entity';
import { User } from '../user/entities/user.entity';
import { FoodInventory } from '../food-inventory/entities/food-inventory.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PushSubscription, User, FoodInventory])],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule { }
