import pino from 'pino';

const transport = pino.transport({
    target: 'pino-pretty',
    options: {
        ignore: 'pid',
        translateTime: true
    }
});

const logger = pino(
    {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        base: undefined
    },
    transport
);


export default logger;
