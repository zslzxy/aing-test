import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import os from 'os';

// Load environment variables
dotenv.config();

// Set up environment for ee-core
const currentDir = process.cwd();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.EE_ENV = 'server'; // Use our server config
process.env.EE_APP_NAME = 'aingdesk-server';
process.env.EE_APP_VERSION = '1.2.3';
process.env.EE_USER_HOME = os.homedir();
process.env.EE_BASE_DIR = currentDir;
process.env.EE_ELECTRON_DIR = path.join(currentDir, 'dist', 'electron');
process.env.EE_ROOT_DIR = currentDir;
process.env.EE_EXEC_DIR = currentDir;

// Set up app directory for ee-core
const appDir = path.join(os.homedir(), '.aingdesk-server');
process.env.EE_APP_DIR = appDir;

import { logger } from 'ee-core/log';

// Import services and controllers
import { totalService } from './electron/service/total';

// Import controllers
import indexController from './electron/controller/index';
import ChatController from './electron/controller/chat';
import ModelController from './electron/controller/model';
import RagController from './electron/controller/rag';
import SearchController from './electron/controller/search';
import ShareController from './electron/controller/share';
import ManagerController from './electron/controller/manager';
import AgentController from './electron/controller/agent';
import mcpController from './electron/controller/mcp';
import OsController from './electron/controller/os';

// Create controller instances
const chatController = new ChatController();
const modelController = new ModelController();
const ragController = new RagController();
const searchController = new SearchController();
const shareController = new ShareController();
const managerController = new ManagerController();
const agentController = new AgentController();
const osController = new OsController();

class NodeServer {
    private app: express.Application;
    private server: any;
    private io: SocketIOServer;
    private port: number;
    private socketPort: number;

    constructor() {
        this.port = process.env.PORT ? parseInt(process.env.PORT) : 7071;
        this.socketPort = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 7070;
        this.app = express();
        this.server = createServer(this.app);
        this.setupMiddleware();
        this.setupSocketIO();
        this.setupRoutes();
        this.initializeServices();
    }

    private setupMiddleware() {
        // CORS configuration
        this.app.use(cors({
            origin: true,
            credentials: true
        }));

        // Body parsing middleware
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

        // Static files (removed frontend serving for pure backend mode)
        // this.app.use('/public', express.static(path.join(__dirname, 'public')));
        // this.app.use(express.static(path.join(__dirname, 'public/dist')));
    }

    private setupSocketIO() {
        this.io = new SocketIOServer(this.server, {
            path: "/socket.io/",
            connectTimeout: 45000,
            pingTimeout: 30000,
            pingInterval: 25000,
            maxHttpBufferSize: 1e8,
            transports: ["polling", "websocket"],
            cors: {
                origin: true,
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            logger.info(`Socket client connected: ${socket.id}`);
            
            socket.on('disconnect', () => {
                logger.info(`Socket client disconnected: ${socket.id}`);
            });

            // Handle socket events for controllers
            this.setupSocketHandlers(socket);
        });
    }

    private setupSocketHandlers(socket: any) {
        // Index controller handlers
        socket.on('get_version', async (data: any, callback: Function) => {
            try {
                const result = await indexController.get_version();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_languages', async (data: any, callback: Function) => {
            try {
                const result = await indexController.get_languages();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('set_language', async (data: any, callback: Function) => {
            try {
                const result = await indexController.set_language(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_client_language', async (data: any, callback: Function) => {
            try {
                const result = await indexController.get_client_language();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_server_language', async (data: any, callback: Function) => {
            try {
                const result = await indexController.get_server_language();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('write_logs', async (data: any, callback: Function) => {
            try {
                const result = await indexController.write_logs(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_data_save_path', async (data: any, callback: Function) => {
            try {
                const result = await indexController.get_data_save_path();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('set_data_save_path', async (data: any, callback: Function) => {
            try {
                const result = await indexController.set_data_save_path(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        // Add more socket handlers for other controllers as needed
        this.setupChatSocketHandlers(socket);
        this.setupModelSocketHandlers(socket);
        this.setupRagSocketHandlers(socket);
        this.setupSearchSocketHandlers(socket);
        this.setupShareSocketHandlers(socket);
        this.setupManagerSocketHandlers(socket);
        this.setupAgentSocketHandlers(socket);
        this.setupMcpSocketHandlers(socket);
        this.setupOsSocketHandlers(socket);
    }

    private setupChatSocketHandlers(socket: any) {
        // Chat controller socket handlers
        socket.on('chat', async (data: any, callback: Function) => {
            try {
                // Create a mock event object for Node.js environment
                const mockEvent = {
                    reply: (channel: string, ...args: any[]) => {
                        socket.emit(channel, ...args);
                    },
                    sender: {
                        send: (channel: string, ...args: any[]) => {
                            socket.emit(channel, ...args);
                        }
                    }
                };
                const result = await chatController.chat(data, mockEvent);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_chat_list', async (data: any, callback: Function) => {
            try {
                const result = await chatController.get_chat_list();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('create_chat', async (data: any, callback: Function) => {
            try {
                const result = await chatController.create_chat(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_model_list', async (data: any, callback: Function) => {
            try {
                const result = await chatController.get_model_list();
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_chat_info', async (data: any, callback: Function) => {
            try {
                const result = await chatController.get_chat_info(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('remove_chat', async (data: any, callback: Function) => {
            try {
                const result = await chatController.remove_chat(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('modify_chat_title', async (data: any, callback: Function) => {
            try {
                const result = await chatController.modify_chat_title(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('delete_chat_history', async (data: any, callback: Function) => {
            try {
                const result = await chatController.delete_chat_history(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('stop_generate', async (data: any, callback: Function) => {
            try {
                const result = await chatController.stop_generate(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });

        socket.on('get_last_chat_history', async (data: any, callback: Function) => {
            try {
                const result = await chatController.get_last_chat_history(data);
                callback(result);
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });
    }

    private setupModelSocketHandlers(socket: any) {
        // Model controller socket handlers
        // Add handlers based on the model controller methods
    }

    private setupRagSocketHandlers(socket: any) {
        // RAG controller socket handlers
        // Add handlers based on the rag controller methods
    }

    private setupSearchSocketHandlers(socket: any) {
        // Search controller socket handlers
        // Add handlers based on the search controller methods
    }

    private setupShareSocketHandlers(socket: any) {
        // Share controller socket handlers
        // Add handlers based on the share controller methods
    }

    private setupManagerSocketHandlers(socket: any) {
        // Manager controller socket handlers
        // Add handlers based on the manager controller methods
    }

    private setupAgentSocketHandlers(socket: any) {
        // Agent controller socket handlers
        // Add handlers based on the agent controller methods
    }

    private setupMcpSocketHandlers(socket: any) {
        // MCP controller socket handlers
        // Add handlers based on the mcp controller methods
    }

    private setupOsSocketHandlers(socket: any) {
        // OS controller socket handlers (excluding Electron-specific ones)
        // Add handlers based on the os controller methods that don't require Electron
    }

    private setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // API routes
        this.app.get('/api/version', async (req, res) => {
            try {
                const result = await indexController.get_version();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get('/api/languages', async (req, res) => {
            try {
                const result = await indexController.get_languages();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/language', async (req, res) => {
            try {
                const result = await indexController.set_language(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Chat API endpoints
        this.app.get('/api/chat/list', async (req, res) => {
            try {
                const result = await chatController.get_chat_list();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/chat/create', async (req, res) => {
            try {
                const result = await chatController.create_chat(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get('/api/chat/models', async (req, res) => {
            try {
                const result = await chatController.get_model_list();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/chat/send', async (req, res) => {
            try {
                const mockEvent = { reply: (data: any) => res.json(data) };
                const result = await chatController.chat(req.body, mockEvent);
                if (!res.headersSent) {
                    res.json(result);
                }
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Default 404 for unknown routes
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
    }

    private async initializeServices() {
        try {
            // Initialize services that don't require Electron
            setTimeout(async () => {
                try {
                    // Share service
                    const { shareService } = require('./electron/service/share');
                    const shareIdPrefix = shareService.generateUniquePrefix();
                    let socket = shareService.connectToCloudServer(shareIdPrefix);
                    shareService.startReconnect(socket, shareIdPrefix);

                    // RAG background tasks
                    const { RagTask } = require('./electron/rag/rag_task');
                    let ragTaskObj = new RagTask();
                    ragTaskObj.parseTask();
                    ragTaskObj.switchToCosineIndex();

                    // MCP service sync
                    const { mcpService } = require('./electron/service/mcp');
                    mcpService.sync_cloud_mcp();

                    logger.info('Services initialized successfully');
                } catch (error) {
                    logger.error('Error initializing services:', error);
                }
            }, 1000);

            // Start statistics service
            totalService.start();

        } catch (error) {
            logger.error('Error during service initialization:', error);
        }
    }

    public start() {
        this.server.listen(this.port, '0.0.0.0', () => {
            logger.info(`HTTP Server running on port ${this.port}`);
            logger.info(`Socket.IO Server running on port ${this.port}`);
            logger.info(`Server accessible at http://0.0.0.0:${this.port}`);
        });
    }
}

// Start the server
const server = new NodeServer();
server.start();

export default NodeServer;