declare class TotalService {
    private apiDomain;
    total(): Promise<void>;
    start(): Promise<void>;
}
/**
 * 导出 TotalService 类的单例实例
 */
export declare const totalService: TotalService;
export {};
