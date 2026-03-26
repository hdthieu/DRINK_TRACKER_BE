import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DrinklogModule } from './drinklog/drinklog.module';
import { HomeReceiptModule } from './home-receipt/home-receipt.module';
import { DrinkTypeModule } from './drink-type/drink-type.module';
import { AuthModule } from './auth/auth.module';
import { RoadmapModule } from './roadmap/roadmap.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: configService.get<boolean>('SSL') ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    DrinklogModule,
    DrinkTypeModule,
    HomeReceiptModule,
    AuthModule,
    RoadmapModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

