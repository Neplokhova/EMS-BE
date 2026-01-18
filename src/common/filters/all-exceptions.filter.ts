import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

function extractMessage(responseBody: unknown): string {
  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (
    typeof responseBody === 'object' &&
    responseBody !== null &&
    'message' in responseBody
  ) {
    const messageValue = (responseBody as { message?: unknown }).message;

    if (Array.isArray(messageValue)) {
      return messageValue.join(', ');
    }

    if (typeof messageValue === 'string') {
      return messageValue;
    }
  }

  return 'Internal server error';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;

    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp ? exception.getResponse() : undefined;

    const message = extractMessage(responseBody);

    response.status(status).json({
      statusCode: status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
