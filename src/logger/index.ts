import pino from 'pino';

export const logger = pino({
    name: 'Tech Updates',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});