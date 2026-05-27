import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  log(message: string) {
    super.log(message, 'BackendApi');
  }

  error(message: string, trace: string) {
    super.error(message, trace, 'BackendApi');
  }

  warn(message: string) {
    super.warn(message, 'BackendApi');
  }

  debug(message: string) {
    super.debug(message, 'BackendApi');
  }

  verbose(message: string) {
    super.verbose(message, 'BackendApi');
  }
}
