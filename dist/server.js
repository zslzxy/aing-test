"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const os_1 = __importDefault(require("os"));
// Load environment variables
dotenv_1.default.config();
// Set up environment for ee-core
const currentDir = process.cwd();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.EE_ENV = 'server'; // Use our server config
process.env.EE_APP_NAME = 'aingdesk-server';
process.env.EE_APP_VERSION = '1.2.3';
process.env.EE_USER_HOME = os_1.default.homedir();
process.env.EE_BASE_DIR = currentDir;
process.env.EE_ELECTRON_DIR = path_1.default.join(currentDir, 'dist', 'electron');
process.env.EE_ROOT_DIR = currentDir;
process.env.EE_EXEC_DIR = currentDir;
// Set up app directory for ee-core
const appDir = path_1.default.join(os_1.default.homedir(), '.aingdesk-server');
process.env.EE_APP_DIR = appDir;
const log_1 = require("ee-core/log");
// Import services and controllers
const total_1 = require("./electron/service/total");
// Import controllers
const index_1 = __importDefault(require("./electron/controller/index"));
const chat_1 = __importDefault(require("./electron/controller/chat"));
const model_1 = __importDefault(require("./electron/controller/model"));
const rag_1 = __importDefault(require("./electron/controller/rag"));
const search_1 = __importDefault(require("./electron/controller/search"));
const share_1 = __importDefault(require("./electron/controller/share"));
const manager_1 = __importDefault(require("./electron/controller/manager"));
const agent_1 = __importDefault(require("./electron/controller/agent"));
const os_2 = __importDefault(require("./electron/controller/os"));
// Create controller instances
const chatController = new chat_1.default();
const modelController = new model_1.default();
const ragController = new rag_1.default();
const searchController = new search_1.default();
const shareController = new share_1.default();
const managerController = new manager_1.default();
const agentController = new agent_1.default();
const osController = new os_2.default();
class NodeServer {
    app;
    server;
    io;
    port;
    socketPort;
    constructor() {
        this.port = process.env.PORT ? parseInt(process.env.PORT) : 7071;
        this.socketPort = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 7070;
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.setupMiddleware();
        this.setupSocketIO();
        this.setupRoutes();
        this.initializeServices();
    }
    setupMiddleware() {
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: true,
            credentials: true
        }));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: '100mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '100mb' }));
        // Static files (removed frontend serving for pure backend mode)
        // this.app.use('/public', express.static(path.join(__dirname, 'public')));
        // this.app.use(express.static(path.join(__dirname, 'public/dist')));
    }
    setupSocketIO() {
        this.io = new socket_io_1.Server(this.server, {
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
            log_1.logger.info(`Socket client connected: ${socket.id}`);
            socket.on('disconnect', () => {
                log_1.logger.info(`Socket client disconnected: ${socket.id}`);
            });
            // Handle socket events for controllers
            this.setupSocketHandlers(socket);
        });
    }
    setupSocketHandlers(socket) {
        // Index controller handlers
        socket.on('get_version', async (data, callback) => {
            try {
                const result = await index_1.default.get_version();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_languages', async (data, callback) => {
            try {
                const result = await index_1.default.get_languages();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('set_language', async (data, callback) => {
            try {
                const result = await index_1.default.set_language(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_client_language', async (data, callback) => {
            try {
                const result = await index_1.default.get_client_language();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_server_language', async (data, callback) => {
            try {
                const result = await index_1.default.get_server_language();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('write_logs', async (data, callback) => {
            try {
                const result = await index_1.default.write_logs(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_data_save_path', async (data, callback) => {
            try {
                const result = await index_1.default.get_data_save_path();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('set_data_save_path', async (data, callback) => {
            try {
                const result = await index_1.default.set_data_save_path(data);
                callback(result);
            }
            catch (error) {
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
    setupChatSocketHandlers(socket) {
        // Chat controller socket handlers
        socket.on('chat', async (data, callback) => {
            try {
                // Create a mock event object for Node.js environment
                const mockEvent = {
                    reply: (channel, ...args) => {
                        socket.emit(channel, ...args);
                    },
                    sender: {
                        send: (channel, ...args) => {
                            socket.emit(channel, ...args);
                        }
                    }
                };
                const result = await chatController.chat(data, mockEvent);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_chat_list', async (data, callback) => {
            try {
                const result = await chatController.get_chat_list();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('create_chat', async (data, callback) => {
            try {
                const result = await chatController.create_chat(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_model_list', async (data, callback) => {
            try {
                const result = await chatController.get_model_list();
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_chat_info', async (data, callback) => {
            try {
                const result = await chatController.get_chat_info(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('remove_chat', async (data, callback) => {
            try {
                const result = await chatController.remove_chat(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('modify_chat_title', async (data, callback) => {
            try {
                const result = await chatController.modify_chat_title(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('delete_chat_history', async (data, callback) => {
            try {
                const result = await chatController.delete_chat_history(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('stop_generate', async (data, callback) => {
            try {
                const result = await chatController.stop_generate(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        socket.on('get_last_chat_history', async (data, callback) => {
            try {
                const result = await chatController.get_last_chat_history(data);
                callback(result);
            }
            catch (error) {
                callback({ success: false, error: error.message });
            }
        });
    }
    setupModelSocketHandlers(socket) {
        // Model controller socket handlers
        // Add handlers based on the model controller methods
    }
    setupRagSocketHandlers(socket) {
        // RAG controller socket handlers
        // Add handlers based on the rag controller methods
    }
    setupSearchSocketHandlers(socket) {
        // Search controller socket handlers
        // Add handlers based on the search controller methods
    }
    setupShareSocketHandlers(socket) {
        // Share controller socket handlers
        // Add handlers based on the share controller methods
    }
    setupManagerSocketHandlers(socket) {
        // Manager controller socket handlers
        // Add handlers based on the manager controller methods
    }
    setupAgentSocketHandlers(socket) {
        // Agent controller socket handlers
        // Add handlers based on the agent controller methods
    }
    setupMcpSocketHandlers(socket) {
        // MCP controller socket handlers
        // Add handlers based on the mcp controller methods
    }
    setupOsSocketHandlers(socket) {
        // OS controller socket handlers (excluding Electron-specific ones)
        // Add handlers based on the os controller methods that don't require Electron
    }
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        // API routes
        this.app.get('/api/version', async (req, res) => {
            try {
                const result = await index_1.default.get_version();
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        this.app.get('/api/languages', async (req, res) => {
            try {
                const result = await index_1.default.get_languages();
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        this.app.post('/api/language', async (req, res) => {
            try {
                const result = await index_1.default.set_language(req.body);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        // Chat API endpoints
        this.app.get('/api/chat/list', async (req, res) => {
            try {
                const result = await chatController.get_chat_list();
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        this.app.post('/api/chat/create', async (req, res) => {
            try {
                const result = await chatController.create_chat(req.body);
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        this.app.get('/api/chat/models', async (req, res) => {
            try {
                const result = await chatController.get_model_list();
                res.json(result);
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        this.app.post('/api/chat/send', async (req, res) => {
            try {
                const mockEvent = { reply: (data) => res.json(data) };
                const result = await chatController.chat(req.body, mockEvent);
                if (!res.headersSent) {
                    res.json(result);
                }
            }
            catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        // Default 404 for unknown routes
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });
    }
    async initializeServices() {
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
                    log_1.logger.info('Services initialized successfully');
                }
                catch (error) {
                    log_1.logger.error('Error initializing services:', error);
                }
            }, 1000);
            // Start statistics service
            total_1.totalService.start();
        }
        catch (error) {
            log_1.logger.error('Error during service initialization:', error);
        }
    }
    start() {
        this.server.listen(this.port, '0.0.0.0', () => {
            log_1.logger.info(`HTTP Server running on port ${this.port}`);
            log_1.logger.info(`Socket.IO Server running on port ${this.port}`);
            log_1.logger.info(`Server accessible at http://0.0.0.0:${this.port}`);
        });
    }
}
// Start the server
const server = new NodeServer();
server.start();
exports.default = NodeServer;
//# sourceMappingURL=server.js.map