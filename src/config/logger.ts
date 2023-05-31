/* eslint-disable prefer-spread */
/** LOGGER **/
'use strict';

import winston, { transports } from 'winston';
require('winston-mail');
import SlackHook from 'winston-slack-webhook-transport';
import path from 'path';
import vars from './vars';

const PROJECT_ROOT = path.join(__dirname, '..');

const options = {
  file: {
    level: 'info',
    filename: process.cwd() + '/logs/error.log',
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    timestamp: true,
    localTime: true,

    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
      winston.format.align(),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        // return '';
        return `${timestamp} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    )
  },
  console: {
    level: 'silly',
    filename: process.cwd() + '/logs/combined.log',
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    timestamp: true,
    localTime: true,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZZ' }),
      winston.format.simple(),
      winston.format.colorize({ all: true }),
      winston.format.align(),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        return `${timestamp} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    )
  },
  verbose: {
    level: 'silly',
    filename: process.cwd() + '/logs/combined.log',
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    timestamp: true,
    localTime: true,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
      winston.format.align(),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        return `${timestamp} ${level}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
      })
    )
  },
  slack: {
    level: 'warn',
    webhookUrl: '',
    formatter: (info: { level: string; message: string }) => ({
      text: `${info.level}: ${info.message}`
    }),
    username: 'WantCodeBot'
  }
};

// your centralized logger object
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(options.console)
    // new winston.transports.File(options.file),
    // new winston.transports.File(options.verbose)
    // new SlackHook(options.slack)
  ],
  exitOnError: false // do not exit on handled exceptions
});

// logger.stream = {
//     write: (message: string): void =>{
//         logger.info(message);
//     },
// };

logger.stream({
  write(message: string): void {
    logger.info(message);
  }
});

export const silly = function (...args: any) {
  logger.silly.apply(logger, formatLogArguments(args));
};

export const debug = function (...args: any) {
  logger.debug.apply(logger, formatLogArguments(args));
};

export const info = function (...args: any) {
  logger.info.apply(logger, formatLogArguments(args));
};

export const warn = function (...args: any) {
  logger.warn.apply(logger, formatLogArguments(args));
};

export const error = function (...args: any) {
  logger.error.apply(logger, formatLogArguments(args));
};

export const { stream } = logger;

const _ = { silly, debug, info, warn, error };
export default _;

/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments(args: any) {
  args = Array.prototype.slice.call(args);

  const stackInfo = getStackInfo(1);

  if (stackInfo) {
    // get file path relative to project root
    const calleeStr = '[' + stackInfo.relativePath + ':' + stackInfo.line + ']';

    if (typeof args[0] === 'string') {
      args[0] = calleeStr + ' ' + args[0];
    } else {
      args.unshift(calleeStr);
    }
  }

  return args;
}

type StackList = { [key: string]: string[] | any };

/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo(stackIndex: string | number) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  const stackList: StackList = new Error().stack.split('\n').slice(3);

  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  //const stackReg = /at\s+(.*)\es+\((.*):(\d*):(\d*)\)/gi;

  const stackReg = /at\s+(.*)s+\((.*):(\d*):(\d*)\)/gi;
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  const s = stackList[stackIndex] || stackList[0];
  const sp = stackReg.exec(s) || stackReg2.exec(s);

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stackList.join('\n')
    };
  }
}
