import OpenAI from 'openai';
type ModelInfo = {
    title: string;
    supplierName: string;
    supplierTitle?: string;
    model: string;
    size: number;
    total?: number;
    capability?: string[];
    contextLength: number;
};
type ApiConfig = {
    baseUrl: string;
    apiKey: string;
    supplierName: string;
    supplierTitle?: string;
    status?: boolean;
};
export declare class ModelService {
    private baseUrl;
    private apiKey;
    client: OpenAI | null;
    error: any;
    private apiConfigPath;
    private apiConfigFile;
    private embeddingFile;
    private modelsFile;
    private apiConfig;
    private models;
    private supplierName;
    constructor(supplierName: string);
    setApiKey(baseUrl: string, apiKey: string): void;
    chat(options: any): Promise<any>;
    embedding(model: string, input: string): Promise<any[]>;
    destroy(): void;
    readApiConfig(): ApiConfig | null;
    readModels(): any[] | null;
    readEmbeddingModels(): any[] | null;
    saveModels(models: any[]): any[];
    getOnlineModels(): Promise<any[] | null>;
    saveEmbeddingModels(models: any[]): any[];
    getOnlineEmbeddingModels(): Promise<any[] | null>;
    connect(): boolean;
    testApi(): Promise<boolean>;
}
export declare function getModelContextLength(model: string): number;
export declare function GetSupplierModels(): Promise<{
    [key: string]: ModelInfo[];
}>;
export declare function GetSupplierEmbeddingModels(): Promise<{
    [key: string]: ModelInfo[];
}>;
/**
 * 统计模型使用次数
 * @param supplierName 模型供应商名称
 * @param modelName 模型名称
 * @returns
 */
export declare function setModelUsedTotal(supplierName: string, modelName: string): void;
/**
 * 获取模型使用次数列表
 * @returns
 */
export declare function getModelUsedTotalList(): any;
/**
 * 获取模型使用次数
 * @param supplierName 模型供应商名称
 * @param modelName 模型名称
 * @returns
 */
export declare function getModelUsedTotal(supplierName: string, modelName: string): any;
export {};
