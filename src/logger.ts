import winston = require('winston');
import { LoggingConfig } from './config';

export interface LogWriter {
  write(message, encoding);
}

export interface Logger {
  writer: LogWriter;
  debug(message?: string, ...optionalParams: any[]);
  info(message?: string, ...optionalParams: any[]);
  warn(message?: string, ...optionalParams: any[]);
  error(message?: string, ...optionalParams: any[]);
}

export class ConsoleLogger implements Logger {
  writer: LogWriter;
  logger: winston.Logger;

  constructor(config: LoggingConfig) {
    const options2 = {
      console: {
        level: 'debug',
        handleExceptions: true,
        colorize: true,
      },
    };

    const transports: any[] = [];

    if (config.console) {
      const options: any = {
        exitOnError: false,
      };
      if (config.console.level) {
        options.level = config.console.level;
      }
      const formatters: any[] = [];
      if (config.console.colorize) {
        formatters.push(winston.format.colorize());
      }

      if (config.console.json) {
        formatters.push(winston.format.json());
      } else {
        formatters.push(winston.format.align());
        formatters.push(winston.format.simple());
      }

      options.format = winston.format.combine(...(formatters as any));
      transports.push(new winston.transports.Console(options));
    }

    this.logger = winston.createLogger({
      level: config.level,
      exitOnError: false,
      transports: transports,
    });

    this.writer = {
      write: message => {
        this.logger.info(message);
      },
    };
  }

  debug(message: string, ...optionalParams: any[]) {
    this.logger.debug(message, optionalParams);
  }

  info(message: string, ...optionalParams: any[]) {
    this.logger.info(message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.logger.warn(message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.logger.error(message, optionalParams);
  }
}

export class PluginLogger implements Logger {
  writer: LogWriter;

  private logEntry(level: string, message?: string, ...optionalParams: any[]) {
    const logEntry = {
      '@level': level,
    };

    if (message) {
      logEntry['@message'] = message;
    }

    if (optionalParams) {
      for (let n = 0; n < optionalParams.length; n += 2) {
        const key = optionalParams[n];
        const value = optionalParams[n + 1];

        if (key !== null && value !== null) {
          logEntry[key] = value;
        }
      }
    }

    console.error(JSON.stringify(logEntry));
  }

  debug(message?: string, ...optionalParams: any[]) {
    this.logEntry('debug', message, ...optionalParams);
  }

  info(message?: string, ...optionalParams: any[]) {
    this.logEntry('info', message, ...optionalParams);
  }

  warn(message?: string, ...optionalParams: any[]) {
    this.logEntry('warn', message, ...optionalParams);
  }

  error(message?: string, ...optionalParams: any[]) {
    this.logEntry('error', message, ...optionalParams);
  }
}
