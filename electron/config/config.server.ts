import path from 'path';
import { getBaseDir } from 'ee-core/ps';

const config = () => {
  return {
    // Server configuration
    server: {
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT) : 7071,
    },
    
    // Socket.IO configuration
    socketServer: {
      enable: true,
      port: process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 7070,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: true,
        credentials: true
      },
      channel: 'socket-channel',
    },
    
    // HTTP server configuration
    httpServer: {
      enable: true,
      https: {
        enable: false,
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem',
      },
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT) : 7071,
    },
    
    // Static files configuration
    static: {
      indexPath: '/public/dist/index.html',
      publicPath: '/public',
    },
    
    // Logger configuration
    logger: {
      level: process.env.LOG_LEVEL || 'INFO',
      outputJSON: false,
      appLogName: 'aingdesk-server.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log',
    },
    
    // CORS configuration
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    
    // File upload configuration
    upload: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['image/*', 'application/pdf', 'text/*', 'application/json'],
    },
    
    // Security configuration
    security: {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
      },
    },
    
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
  };
};

export default config;