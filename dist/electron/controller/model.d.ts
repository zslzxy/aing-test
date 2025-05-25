import { ReturnMsg as Result } from '../class/public';
/**
 * model controller 类，用于管理模型供应端及模型相关的操作
 * @class
 */
declare class ModelController {
    private readonly modelsPath;
    constructor();
    private readJsonFile;
    private writeJsonFile;
    private handleResult;
    private getSupplierPath;
    private getSupplierConfigPath;
    private getModelsFilePath;
    /**
     * 同步模型供应商模板信息
     * @returns
     */
    sync_supplier_template(): Promise<void>;
    /**
     * 获取模型供应商列表
     * @param args
     * @returns
     */
    get_supplier_list(args: any): Promise<Result>;
    /**
     * 获取模型列表
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns
     */
    get_models_list(args: {
        supplierName: string;
    }): Promise<Result>;
    /**
     * 添加模型
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.capability - 模型能力
     * @returns
     */
    add_models(args: {
        title: string;
        supplierName: string;
        modelName: string;
        capability: string;
    }): Promise<Result>;
    /**
     * 删除模型
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @returns
     */
    remove_models(args: {
        supplierName: string;
        modelName: string;
    }): Promise<Result>;
    /**
     * 设置模型配置
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.baseUrl - 模型供应商接口地址
     * @param args.apiKey - 模型供应商接口密钥
     * @returns
     */
    set_supplier_config(args: {
        supplierName: string;
        baseUrl: string;
        apiKey: string;
    }): Promise<Result>;
    /**
     * 检查模型供应商API配置
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.baseUrl - 模型供应商接口地址
     * @param args.apiKey - 模型供应商接口密钥
     * @returns
     */
    check_supplier_config(args: {
        supplierName: string;
        baseUrl: string;
        apiKey: string;
    }): Promise<Result>;
    /**
     * 获取模型供应商API配置
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns
     */
    get_supplier_config(args: {
        supplierName: string;
    }): Promise<Result>;
    /**
     * 设置模型服务商状态
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.status - 模型供应商状态
     * @returns
     */
    set_supplier_status(args: {
        supplierName: string;
        status: string;
    }): Promise<Result>;
    /**
     * 设置指定模型状态
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称,多个用逗号分隔
     * @param args.status - 模型状态
     * @returns
     */
    set_model_status(args: {
        supplierName: string;
        modelName: string;
        status: string;
    }): Promise<Result>;
    /**
     * 添加新的模型供应商
     * @param args
     * @param args.supplierName - 模型供应商名称(英文名)
     * @param args.supplierTitle - 模型供应商标题
     * @param args.baseUrl - 模型供应商接口地址
     * @param args.apiKey - 模型供应商接口密钥
     * @return {Promise<Result>} - 返回添加结果
     */
    add_supplier(args: {
        supplierName: string;
        supplierTitle: string;
        baseUrl: string;
        apiKey: string;
    }): Promise<Result>;
    /**
     * 删除模型供应商
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns
     */
    remove_supplier(args: {
        supplierName: string;
    }): Promise<Result>;
    /**
     * 重新获取在线模型列表
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @returns {Promise<Result>}
     */
    get_online_models(args: {
        supplierName: string;
    }): Promise<Result>;
    /**
     * 设置模型标题
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.title - 模型标题
     * @return {Promise<Result>} - 返回设置结果
     */
    set_model_title(args: {
        supplierName: string;
        modelName: string;
        title: string;
    }): Promise<Result>;
    /**
     * 修改模型能力
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.capability - 模型能力
     * @return {Promise<Result>} - 返回修改结果
     */
    set_model_capability(args: {
        supplierName: string;
        modelName: string;
        capability: string;
    }): Promise<Result>;
    /**
     * 修改模型信息
     * @param args
     * @param args.supplierName - 模型供应商名称
     * @param args.modelName - 模型名称
     * @param args.capability - 模型能力
     * @param args.title - 模型标题
     * @return {Promise<Result>} - 返回修改结果
     */
    modify_model(args: {
        supplierName: string;
        modelName: string;
        capability: string;
        title: string;
    }): Promise<Result>;
}
export default ModelController;
