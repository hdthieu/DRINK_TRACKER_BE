import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // Allow all origins for simplicity in this development/demo stage, but safer would be the specific Vercel URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const formatErrors = (errors: any[]) => {
        return errors.reduce((acc, error) => {
          if (error.children && error.children.length > 0) {
            acc[error.property] = formatErrors(error.children);
          } else {
            acc[error.property] = Object.values(error.constraints || {})[0];
          }
          return acc;
        }, {});
      };
      return new BadRequestException(formatErrors(errors));
    },
  }));

  // Unified Success Wrapper
  app.useGlobalInterceptors(new TransformInterceptor());

  // Unified Error Wrapper
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on port: ${port}`);
}


bootstrap();
