import log4js from 'log4js';

let logger = null;

const getLogger = () => {
  if (!logger) {
    logger = log4js.configure({
      appenders: {
        console: {
          type: 'console',
          layout: {
            type: 'pattern',
            pattern: '%[[%d{hh:mm:ss.SSS}][%4.4p]%] %m'
          }
        }
      },
      categories: {
        default: {
          appenders: ['console'],
          level: 'info'
        }
      }
    }).getLogger();
  }
  return {
    info: (msg) => logger.info(msg),
    warn: (msg) => logger.warn(msg),
    error: (msg) => logger.error(msg),
    debug: (msg) => logger.debug(msg),
    trace: (msg) => logger.trace(msg),
    fatal: (msg) => logger.fatal(msg)
  };
};

export default getLogger();
