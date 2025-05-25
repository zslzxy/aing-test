declare const config: () => {
    server: {
        host: string;
        port: number;
    };
    socketServer: {
        enable: boolean;
        port: number;
        path: string;
        connectTimeout: number;
        pingTimeout: number;
        pingInterval: number;
        maxHttpBufferSize: number;
        transports: string[];
        cors: {
            origin: boolean;
            credentials: boolean;
        };
        channel: string;
    };
    httpServer: {
        enable: boolean;
        https: {
            enable: boolean;
            key: string;
            cert: string;
        };
        host: string;
        port: number;
    };
    static: {
        indexPath: string;
        publicPath: string;
    };
    logger: {
        level: string;
        outputJSON: boolean;
        appLogName: string;
        coreLogName: string;
        errorLogName: string;
    };
    cors: {
        origin: boolean;
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
    };
    security: {
        rateLimit: {
            windowMs: number;
            max: number;
        };
    };
    env: string;
    isDevelopment: boolean;
    isProduction: boolean;
};
export default config;
