import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { join } from 'path';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any },
            }),
            inject: [ConfigService],
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.getOrThrow<string>('MAIL_HOST'),
                    port: config.getOrThrow<number>('MAIL_PORT'),
                    auth: {
                        user: config.getOrThrow<string>('MAIL_USER'),
                        pass: config.getOrThrow<string>('MAIL_PASS'),
                    },
                },
                defaults: {
                    from: config.getOrThrow<string>('MAIL_FROM'),
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
