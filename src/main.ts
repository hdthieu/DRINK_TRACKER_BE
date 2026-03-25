import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const result = errors.reduce((acc, error) => {
        acc[error.property] = Object.values(error.constraints || {})[0];
        return acc;
      }, {});
      return new BadRequestException(result);
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
