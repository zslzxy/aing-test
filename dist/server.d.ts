declare class NodeServer {
    private app;
    private server;
    private io;
    private port;
    private socketPort;
    constructor();
    private setupMiddleware;
    private setupSocketIO;
    private setupSocketHandlers;
    private setupChatSocketHandlers;
    private setupModelSocketHandlers;
    private setupRagSocketHandlers;
    private setupSearchSocketHandlers;
    private setupShareSocketHandlers;
    private setupManagerSocketHandlers;
    private setupAgentSocketHandlers;
    private setupMcpSocketHandlers;
    private setupOsSocketHandlers;
    private setupRoutes;
    private initializeServices;
    start(): void;
}
export default NodeServer;
