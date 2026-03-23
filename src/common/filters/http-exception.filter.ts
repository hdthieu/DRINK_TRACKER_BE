import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse = exception instanceof HttpException
            ? exception.getResponse()
            : { message: 'Internal server error 🌸' };

        const message = typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exceptionResponse;

        const errorCode = (exceptionResponse as any).errorCode || 'UNKNOWN_ERROR';

        response.status(status).json({
            success: false,
            statusCode: status,
            errorCode: errorCode,
            message: message,
            timestamp: new Date().toISOString(),
            path: (request as any).url,
        });
    }
}
