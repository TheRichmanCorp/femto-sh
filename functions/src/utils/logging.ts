import { createLogger, transports, format } from "winston";
import { SeqTransport } from '@datalust/winston-seq';
import { LoggingWinston } from '@google-cloud/logging-winston';
import winston from "winston/lib/winston/config";


const SEQ_SERVER = process.env.SEQ_SERVER ?? ''
const SEQ_API_KEY = process.env.SEQ_API_KEY ?? ''

const cloudLogging = new LoggingWinston();
const seqTransport = new SeqTransport({
  serverUrl: SEQ_SERVER,
  apiKey: SEQ_API_KEY,
  onError: ((e: any) => { console.error(e) }),
  handleExceptions: true,
  handleRejections: true,
})

export const logging = createLogger({
  transports: [new transports.Console(), cloudLogging, seqTransport],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, service }) => {
      return `[${timestamp}] ${service} ${level}: ${message}`;
    })
  ),
  defaultMeta: {
    application: "Femto Shell",
  },
});

export type LoggingMetadata = {
  applicationName?: string;
  service: string;
  country?: number;
};

//Todo: prevent  MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added to [SeqTransport]
export const getLogger = (metadata?: LoggingMetadata) => {
  const defaultMetadata = {
    application: process.env.APPLICATION_NAME,
  }
  //private static logger: winston.Logger;
  const parameterizeMetadata = metadata ?? { service: 'core' }
  const allowTransport = []
  if (process.env.LOG_TO_CONSOLE === '1') allowTransport.push(new transports.Console())
  if (process.env.LOG_TO_CLOUD === '1') allowTransport.push(cloudLogging)
  if (process.env.LOG_TO_SEQ === '1') allowTransport.push(seqTransport)
  return createLogger({
    transports: allowTransport,
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message, service }) => {
        return `[${timestamp}] ${service} ${level}: ${message}`;
      })
    ),
    defaultMeta: { ...defaultMetadata, ...parameterizeMetadata },
  });
}