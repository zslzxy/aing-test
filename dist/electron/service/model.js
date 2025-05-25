"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelService = void 0;
exports.getModelContextLength = getModelContextLength;
exports.GetSupplierModels = GetSupplierModels;
exports.GetSupplierEmbeddingModels = GetSupplierEmbeddingModels;
exports.setModelUsedTotal = setModelUsedTotal;
exports.getModelUsedTotalList = getModelUsedTotalList;
exports.getModelUsedTotal = getModelUsedTotal;
const openai_1 = __importDefault(require("openai"));
const path_1 = __importDefault(require("path"));
const public_1 = require("../class/public");
// 定义模型服务类
class ModelService {
    baseUrl = "";
    apiKey = "";
    client = null;
    error = null;
    apiConfigPath = "";
    apiConfigFile = "";
    embeddingFile = "";
    modelsFile = "";
    apiConfig = {};
    models = [];
    supplierName;
    constructor(supplierName) {
        this.supplierName = supplierName;
        if (this.supplierName === 'ollama') {
            this.baseUrl = `${public_1.pub.get_ollama_host()}/v1`;
            this.apiKey = supplierName;
        }
        else {
            this.readApiConfig();
        }
    }
    // 设置 API 密钥
    setApiKey(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    // 流式对话
    async chat(options) {
        if (!this.connect()) {
            throw new Error('Failed to connect to the API');
        }
        try {
            return await this.client.chat.completions.create(options);
        }
        catch (error) {
            this.error = error;
            throw error;
        }
    }
    // 嵌入模型调用
    async embedding(model, input) {
        if (!this.connect()) {
            return [];
        }
        try {
            const res = await this.client.embeddings.create({
                model,
                input,
                encoding_format: "float"
            });
            return res.data[0] || [];
        }
        catch (error) {
            this.error = error;
            return [];
        }
    }
    // 释放资源
    destroy() {
        this.client = null;
    }
    // 读取 API 配置
    readApiConfig() {
        this.apiConfigPath = path_1.default.resolve(public_1.pub.get_data_path(), "models", this.supplierName);
        this.apiConfigFile = path_1.default.resolve(this.apiConfigPath, "config.json");
        this.modelsFile = path_1.default.resolve(this.apiConfigPath, "models.json");
        this.embeddingFile = path_1.default.resolve(this.apiConfigPath, "embedding.json");
        if (!public_1.pub.file_exists(this.apiConfigFile)) {
            return null;
        }
        try {
            const apiConfigBody = public_1.pub.read_file(this.apiConfigFile);
            this.apiConfig = JSON.parse(apiConfigBody);
            this.setApiKey(this.apiConfig.baseUrl, this.apiConfig.apiKey);
            return this.apiConfig;
        }
        catch (error) {
            this.error = error;
            return null;
        }
    }
    // 读取模型列表
    readModels() {
        if (!public_1.pub.file_exists(this.modelsFile)) {
            return null;
        }
        try {
            const modelsBody = public_1.pub.read_file(this.modelsFile);
            this.models = JSON.parse(modelsBody);
            return this.models;
        }
        catch (error) {
            this.error = error;
            return null;
        }
    }
    // 读取嵌套模型列表
    readEmbeddingModels() {
        if (!public_1.pub.file_exists(this.embeddingFile)) {
            return null;
        }
        try {
            const modelsBody = public_1.pub.read_file(this.embeddingFile);
            this.models = JSON.parse(modelsBody);
            return this.models;
        }
        catch (error) {
            this.error = error;
            return null;
        }
    }
    // 保存模型列表
    saveModels(models) {
        let modelsList = this.readModels() || [];
        for (const model of models) {
            if (!modelsList.some((item) => item.modelName === model.id)) {
                const modelInfo = {
                    title: "",
                    supplierName: this.supplierName,
                    modelName: model.id,
                    capability: ["llm"],
                    status: true
                };
                modelsList.push(modelInfo);
            }
        }
        const modelsBody = JSON.stringify(modelsList, null, 4);
        public_1.pub.write_file(this.modelsFile, modelsBody);
        this.models = modelsList;
        return modelsList;
    }
    // 获取线上模型列表
    async getOnlineModels() {
        if (!this.connect()) {
            return null;
        }
        try {
            const res = await this.client.models.list({
                query: {
                    sub_type: 'chat'
                }
            });
            const models = res.body.data;
            if (this.supplierName == 'SiliconFlow') {
                await this.getOnlineEmbeddingModels();
            }
            return this.saveModels(models);
        }
        catch (error) {
            this.error = error;
            return null;
        }
    }
    // 保存嵌套模型列表
    saveEmbeddingModels(models) {
        let modelsList = this.readEmbeddingModels() || [];
        for (const model of models) {
            if (!modelsList.some((item) => item.modelName === model.id)) {
                const modelInfo = {
                    title: "",
                    supplierName: this.supplierName,
                    modelName: model.id,
                    capability: ["embedding"],
                    status: true
                };
                modelsList.push(modelInfo);
            }
        }
        const modelsBody = JSON.stringify(modelsList, null, 4);
        public_1.pub.write_file(this.embeddingFile, modelsBody);
        this.models = modelsList;
        return modelsList;
    }
    // 获取线上嵌套模型列表
    async getOnlineEmbeddingModels() {
        if (!this.connect()) {
            return null;
        }
        try {
            const res = await this.client.models.list({
                query: {
                    sub_type: 'embedding'
                }
            });
            const models = res.body.data;
            return this.saveEmbeddingModels(models);
        }
        catch (error) {
            this.error = error;
            return null;
        }
    }
    // 连接 API
    connect() {
        if (this.client) {
            return true;
        }
        if (!this.apiKey || !this.baseUrl) {
            this.readApiConfig();
        }
        if (!this.apiKey || !this.baseUrl) {
            this.error = "API 配置错误";
            return false;
        }
        try {
            this.client = new openai_1.default({
                apiKey: this.apiKey,
                baseURL: this.baseUrl,
            });
            return true;
        }
        catch (error) {
            this.error = error;
            return false;
        }
    }
    // 测试 API 接口是否可用
    async testApi() {
        if (!this.connect()) {
            return false;
        }
        try {
            await this.client.models.list();
            return true;
        }
        catch (error) {
            this.error = error;
            return false;
        }
    }
}
exports.ModelService = ModelService;
// 获取模型上下文长度
function getModelContextLength(model) {
    const modelContextObj = {
        "qwq": 32768,
        "qwen2.5": 32768,
        "qwen": 32768,
        "deepseek": 32768,
        "phi": 16384,
        "gemma2": 8192,
        "smollm": 8192,
        "llama": 32768,
        "glm": 32768,
        "qvq": 32768,
    };
    const modelStrLower = model.toLowerCase();
    for (const key in modelContextObj) {
        if (modelStrLower.includes(key)) {
            return modelContextObj[key];
        }
    }
    return 32768;
}
function isTools(model) {
    let notTools = ['deepseek-r1', 'deepseek-v3', 'deepseek-reasoner', 'lite', 'gemma2', 'smollm', 'llama', 'glm', 'qvq'];
    if (notTools.some((item) => model.toLowerCase().indexOf(item) > -1)) {
        return false;
    }
    return true;
}
function getCapability(model, capability) {
    if (capability.length == 0) {
        capability.push("llm");
    }
    const modelStrLower = model.toLowerCase();
    if (capability.includes("embedding")) {
        return capability;
    }
    if (capability.includes("llm")) {
        if (capability.includes("tools")) {
            return capability;
        }
        if (isTools(modelStrLower)) {
            capability.push("tools");
        }
        return capability;
    }
    return capability;
}
// 读取供应商模型列表的通用函数
async function readSupplierModels(fileName, contextLengthFunc) {
    const supplierPath = path_1.default.resolve(public_1.pub.get_data_path(), "models");
    const suppliers = public_1.pub.readdir(supplierPath);
    const result = {};
    for (const supplier of suppliers) {
        const supplierConfigFile = path_1.default.resolve(supplier, "config.json");
        const modelConfigFile = path_1.default.resolve(supplier, fileName);
        if (!public_1.pub.file_exists(supplierConfigFile) || !public_1.pub.file_exists(modelConfigFile)) {
            continue;
        }
        try {
            const supplierConfigBody = public_1.pub.read_file(supplierConfigFile);
            const supplierConfig = JSON.parse(supplierConfigBody);
            const modelConfigBody = public_1.pub.read_file(modelConfigFile);
            const models = JSON.parse(modelConfigBody);
            if (!supplierConfig.supplierName || models.length === 0) {
                continue;
            }
            if (!supplierConfig.apiKey || !supplierConfig.baseUrl || supplierConfig.status === false) {
                continue;
            }
            const newModels = [];
            for (const model of models) {
                const modelInfo = {
                    title: model.title || `${supplierConfig.supplierTitle || supplierConfig.supplierName}/${model.modelName}`,
                    supplierName: supplierConfig.supplierName,
                    supplierTitle: supplierConfig.supplierTitle || supplierConfig.supplierName,
                    model: model.modelName,
                    size: 0,
                    contextLength: contextLengthFunc(model.modelName),
                    capability: getCapability(model.modelName, model.capability || []),
                };
                newModels.push(modelInfo);
            }
            result[supplierConfig.supplierTitle] = newModels;
        }
        catch (error) {
            console.error(`Error reading models for supplier ${supplier}:`, error);
        }
    }
    return result;
}
// 获取所有模型列表
async function GetSupplierModels() {
    return readSupplierModels("models.json", getModelContextLength);
}
// 获取所有嵌套模型列表
async function GetSupplierEmbeddingModels() {
    return readSupplierModels("embedding.json", () => 512);
}
/**
 * 统计模型使用次数
 * @param supplierName 模型供应商名称
 * @param modelName 模型名称
 * @returns
 */
function setModelUsedTotal(supplierName, modelName) {
    let totalFile = path_1.default.resolve(public_1.pub.get_data_path(), 'modelTotal.json');
    if (!public_1.pub.file_exists(totalFile)) {
        public_1.pub.write_file(totalFile, '{}');
    }
    let models = {};
    try {
        models = public_1.pub.read_json(totalFile);
    }
    catch (e) {
        public_1.pub.write_file(totalFile, '{}');
        models = {};
    }
    let key = `${supplierName}/${modelName}`;
    if (!models[key]) {
        models[key] = 0;
    }
    models[key]++;
    public_1.pub.write_json(totalFile, models);
}
/**
 * 获取模型使用次数列表
 * @returns
 */
function getModelUsedTotalList() {
    let totalFile = path_1.default.resolve(public_1.pub.get_data_path(), 'modelTotal.json');
    if (!public_1.pub.file_exists(totalFile)) {
        return {};
    }
    try {
        let models = public_1.pub.read_json(totalFile);
        return models;
    }
    catch (e) {
        return {};
    }
}
/**
 * 获取模型使用次数
 * @param supplierName 模型供应商名称
 * @param modelName 模型名称
 * @returns
 */
function getModelUsedTotal(supplierName, modelName) {
    let totalObj = getModelUsedTotalList();
    let key = `${supplierName}/${modelName}`;
    if (!totalObj[key]) {
        return 0;
    }
    return totalObj[key];
}
//# sourceMappingURL=model.js.map