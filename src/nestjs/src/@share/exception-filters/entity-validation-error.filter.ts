import { EntityValidationError } from '@fc/micro-videos/@seedwork/domain';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(EntityValidationError)
export class EntityValidationErrorFilter implements ExceptionFilter {
  catch(exception: EntityValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const statusCode = 422;

    res.status(statusCode).json({
      statusCode,
      error: 'Unprocessable Entity',
      message: Object.values(exception.error).flat(),
    });
  }
}
