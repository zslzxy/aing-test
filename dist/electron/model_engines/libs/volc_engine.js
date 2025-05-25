"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const public_1 = require("../../class/public");
const path_1 = __importDefault(require("path"));
const supplierName = 'VolcEngine';
const supplierPath = path_1.default.resolve(public_1.pub.get_data_path(), "models", supplierName);
class VolcEngine {
    baseUrl;
    apiKey;
    configFile;
    modelFile;
    embeddingFile;
    config;
    constructor() {
        this.baseUrl = '';
        this.apiKey = '';
        this.configFile = path_1.default.resolve(supplierPath, 'config.json');
        this.modelFile = path_1.default.resolve(supplierPath, 'models.json');
        this.embeddingFile = path_1.default.resolve(supplierPath, 'embedding.json');
        this.getConfig();
    }
    /**
     * 获取配置信息
     * @returns {Promise<any>} 包含配置信息的对象，封装在成功响应中返回
     * @memberof VolcEngine
     */
    getConfig() {
        this.config = public_1.pub.read_json(this.configFile);
        this.baseUrl = this.config.baseUrl;
        this.apiKey = this.config.apiKey;
        return this.config;
    }
    /**
     * 获取线上模型列表
     * @returns {Promise<any>} 包含模型列表的对象，封装在成功响应中返回
     * @memberof VolcEngine
     */
    async getOnlineModels() {
        let url = `${this.baseUrl}/models?Action=ListFoundationModels&Version=2024-01-01`;
        let res = await public_1.pub.httpRequest(url, {
            method: 'GET',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Bearer ${this.apiKey}`
            }
        });
        return res;
    }
}
//# sourceMappingURL=volc_engine.js.map