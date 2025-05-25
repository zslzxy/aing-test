import tls from 'tls';
declare class ShareService {
    getShareChatList(shareId: string): import("../class/public").ReturnMsg;
    getShareChatInfo(shareId: string, contextId: string): import("../class/public").ReturnMsg;
    createChat(shareId: string, title: string): import("../class/public").ReturnMsg;
    removeChat(shareId: string, contextId: string): import("../class/public").ReturnMsg;
    abortChat(contextId: string): import("../class/public").ReturnMsg;
    chat(conn: tls.TLSSocket, data: {
        supplierName?: string;
        modelStr: string;
        content: string;
        shareInfo: any;
        contextId: string;
        search?: string;
        regenerate_id?: string;
        images?: string[];
        doc_files?: string[];
        rag_list?: string[];
        agent_name?: string;
        mcp_servers?: string[];
    }, msgId: number): Promise<import("../class/public").ReturnMsg>;
    existsShareId(shareId: string): boolean;
    getShareInfo(shareId: string): any;
    generateUniquePrefix(): any;
    sendToServer(conn: tls.TLSSocket, data: any, msgId: number): void;
    handleReceivedData(conn: any, data: any): void;
    receiveData(conn: any): void;
    connectToCloudServer(shareIdPrefix: any): tls.TLSSocket;
    startReconnect(socket: any, shareIdPrefix: any): void;
}
/**
 * 导出 ShareService 类的单例实例
 */
export declare const shareService: ShareService;
export {};
