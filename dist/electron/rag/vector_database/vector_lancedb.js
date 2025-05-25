"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanceDBManager = void 0;
const lancedb = __importStar(require("@lancedb/lancedb"));
const public_1 = require("../../class/public");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const log_1 = require("ee-core/log");
const model_1 = require("../../service/model");
/**
 * LanceDB向量数据库管理类
 */
class LanceDBManager {
    // 向量维度
    static DIMENSION = 1024;
    // 是否启用性能监控
    static ENABLE_METRICS = false;
    static async connect(dbPath) {
        if (!dbPath) {
            dbPath = public_1.pub.get_db_path();
        }
        const db = await lancedb.connect(dbPath);
        return db;
    }
    // 优化指定表
    static async optimizeTable(tableName) {
        try {
            let dbPath = public_1.pub.get_db_path();
            let dataPath = path.resolve(dbPath, tableName + ".lance");
            if (!fs.existsSync(dataPath)) {
                return public_1.pub.lang('指定表不存在');
            }
            let oldSize = public_1.pub.getDirSize(dataPath);
            const db = await lancedb.connect(public_1.pub.get_db_path());
            const tableObj = await db.openTable(tableName);
            await tableObj.optimize({
                deleteUnverified: true,
                cleanupOlderThan: new Date(),
            });
            tableObj.close();
            db.close();
            let newSize = public_1.pub.getDirSize(dataPath);
            let size = oldSize - newSize;
            if (size < 0)
                size = 0;
            return public_1.pub.lang('优化成功,释放空间: {}', public_1.pub.bytesChange(size));
        }
        catch (e) {
            log_1.logger.error('优化表失败', e);
            return public_1.pub.lang('优化失败: {}', e.message);
        }
    }
    // 优化所有表
    static async optimizeAllTable() {
        try {
            if (global.isOptimizeAllTable) {
                return;
            }
            global.isOptimizeAllTable = true;
            let tipPath = path.join(public_1.pub.get_data_path(), 'rag', 'index_tips');
            let tipFile = path.join(tipPath, `optimize-${public_1.pub.getCurrentDate()}.pl`);
            if (fs.existsSync(tipFile)) {
                global.isOptimizeAllTable = false;
                return;
            }
            const db = await lancedb.connect(public_1.pub.get_db_path());
            const tables = await db.tableNames();
            let optimizedTables = [];
            let startTime = public_1.pub.time();
            for (let table of tables) {
                const tableObj = await db.openTable(table);
                await tableObj.optimize({ deleteUnverified: true, cleanupOlderThan: new Date() });
                tableObj.close();
                optimizedTables.push(table);
            }
            let endTime = public_1.pub.time();
            db.close();
            if (!fs.existsSync(tipPath)) {
                fs.mkdirSync(tipPath, { recursive: true });
            }
            public_1.pub.write_file(tipFile, `optimizedTables: ${optimizedTables.join(',')}\ntime: ${endTime - startTime}s`);
        }
        catch (e) {
            log_1.logger.error('优化表失败', e);
        }
        finally {
            global.isOptimizeAllTable = false;
        }
    }
    /**
     * 确保数据库目录存在
     */
    static ensureDatabaseDirectory() {
        let dbPath = public_1.pub.get_db_path();
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }
    }
    /**
     * 开始性能监控
     * @param operation 操作名称
     * @returns 性能指标对象
     */
    static startMetrics(operation) {
        return this.ENABLE_METRICS
            ? { operation, startTime: performance.now() }
            : { operation, startTime: 0 };
    }
    /**
     * 结束性能监控并输出结果
     * @param metrics 性能指标对象
     */
    static endMetrics(metrics) {
        if (!this.ENABLE_METRICS)
            return;
        metrics.endTime = performance.now();
        metrics.duration = metrics.endTime - metrics.startTime;
        log_1.logger.info(`[性能] ${metrics.operation}: ${metrics.duration.toFixed(2)}ms`);
    }
    static getEmbeddingCachePath() {
        return path.join(public_1.pub.get_data_path(), 'embedding_cache');
    }
    /**
     * 清理过期的向量缓存
     */
    static async clearExpiredCache() {
        if (global.isClearExpiredCache) {
            return;
        }
        let cache_path = this.getEmbeddingCachePath();
        let files = public_1.pub.readdir(cache_path);
        // 清理一周前的缓存
        let now = new Date();
        let nowTime = now.getTime();
        let week = 1000 * 60 * 60 * 24 * 7;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let stat = fs.statSync(file);
            let atime = stat.atime.getTime();
            if (nowTime - atime > week) {
                fs.unlinkSync(file);
            }
        }
        global.isClearExpiredCache = true;
    }
    /**
     * 获取向量缓存
     * @param key 缓存键
     * @returns number[]
     */
    static async getEmbeddingCache(key) {
        let cache_path = this.getEmbeddingCachePath();
        if (!fs.existsSync(cache_path)) {
            fs.mkdirSync(cache_path, { recursive: true });
        }
        let cache_file = path.join(cache_path, `${key}.json`);
        if (fs.existsSync(cache_file)) {
            let cache = public_1.pub.read_json(cache_file);
            // 修改文件访问时间
            let now = new Date();
            fs.utimesSync(cache_file, now, now);
            return cache;
        }
        // 如果缓存不存在，返回空数组
        return [];
    }
    /**
     * 设置向量缓存
     * @param key <string> 缓存键
     * @param embedding <number[]> 向量嵌入
     * @returns void
     */
    static async setEmbeddingCache(key, embedding) {
        let cache_path = this.getEmbeddingCachePath();
        if (!fs.existsSync(cache_path)) {
            fs.mkdirSync(cache_path, { recursive: true });
        }
        // 检查嵌入是否有效
        if (!embedding || embedding.length == 0) {
            return;
        }
        let cache_file = path.join(cache_path, `${key}.json`);
        public_1.pub.write_file(cache_file, JSON.stringify(embedding));
        this.clearExpiredCache();
    }
    /**
     * 获取文本的向量嵌入
     * @param supplierName 供应商名称
     * @param model 使用的模型名称
     * @param text 需要嵌入的文本
     * @returns 向量嵌入
     * @throws 如果嵌入生成失败或维度不匹配
     */
    static async getEmbedding(supplierName, model, text) {
        const metrics = this.startMetrics(`生成嵌入 (${text.substring(0, 30)}...)`);
        let key = public_1.pub.md5(`${supplierName}-${model}-${text}`);
        // 检查缓存
        let embedding = await this.getEmbeddingCache(key);
        if (embedding.length > 0) {
            return embedding;
        }
        try {
            let res;
            if (supplierName == 'ollama') {
                // 使用ollama服务
                const ollama = public_1.pub.init_ollama();
                res = await ollama.embeddings({
                    model: model,
                    prompt: text,
                });
            }
            else {
                // 使用第三方模型服务
                let modelService = new model_1.ModelService(supplierName);
                res = await modelService.embedding(model, text);
                modelService.destroy();
                if (!res) {
                    throw new Error(modelService.error);
                }
            }
            if (!res.embedding || res.embedding.length !== this.DIMENSION) {
                if (!res.embedding) {
                    throw new Error(`嵌入维度错误: 期望 ${this.DIMENSION}, 实际 ${res.embedding ? res.embedding.length : 0}, 模型: ${model}, 文本: ${text}`);
                }
                // 不足的维度以0填充
                if (res.embedding && res.embedding.length < this.DIMENSION) {
                    const padding = new Array(this.DIMENSION - res.embedding.length).fill(0);
                    res.embedding = res.embedding.concat(padding);
                }
            }
            // 设置缓存
            await this.setEmbeddingCache(key, res.embedding);
            return res.embedding;
        }
        catch (error) {
            throw new Error(`生成嵌入时出错: ${error.message}`);
        }
        finally {
            this.endMetrics(metrics);
        }
    }
    /**
     * 检查表是否存在
     * @param db LanceDB连接
     * @param table 表名
     * @returns 表是否存在
     */
    static async tableExists(db, table) {
        try {
            const tables = await db.tableNames();
            return tables.includes(table);
        }
        catch {
            return false;
        }
    }
    /**
     * 创建表
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param initialText 初始文本
     * @returns 成功创建的表名
     */
    static async createTable(tableName, supplierName, model, initialText) {
        const metrics = this.startMetrics(`创建表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否已存在
            if (await this.tableExists(db, tableName)) {
                throw new Error(`表 "${tableName}" 已存在`);
            }
            // 获取初始文本的嵌入
            const embedding = await this.getEmbedding(supplierName, model, initialText);
            // 创建表
            const tableObj = await db.createTable(tableName, [{
                    id: "1",
                    doc: initialText,
                    vector: embedding,
                    docId: '0',
                    tokens: initialText,
                    keywords: ["keyword1", "keyword2"]
                }]);
            // // vector索引
            // try{
            //     await tableObj.createIndex("vector", {
            //         config: lancedb.Index.ivfPq({
            //             distanceType: 'cosine', // 余弦距离
            //         })
            //     });
            // }
            // catch(e){
            //     logger.info('创建vector索引失败',e)
            // }
            // docId索引
            try {
                await tableObj.createIndex("docId", {
                    config: lancedb.Index.btree()
                });
            }
            catch (e) {
                log_1.logger.error('创建docId索引失败', e);
            }
            // tokens索引
            try {
                await tableObj.createIndex("tokens", {
                    config: lancedb.Index.fts() // 全文搜索
                });
            }
            catch (e) {
                log_1.logger.error('创建doc索引失败', e);
            }
            // keywords索引
            try {
                await tableObj.createIndex('keywords', {
                    config: lancedb.Index.labelList() // 
                });
            }
            catch (e) {
                log_1.logger.error('创建keywords索引失败', e);
            }
            await tableObj.delete(`id='1'`);
            // logger.info(`成功创建表: ${tableName}`);
            return tableName;
        }
        catch (error) {
            throw new Error(`创建表失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 自定义创建表
     * @param tableName 表名
     * @param tableStruct 表结构
     * @param indexKeys 索引 示例：[{key:'msg',type:'ivfPq'},{key:'docId',type:'btree'}]
     * @returns boolean
     */
    static async createTableAt(tableName, tableStruct, indexKeys) {
        const metrics = this.startMetrics(`创建表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否已存在
            if (await this.tableExists(db, tableName)) {
                throw new Error(`表 "${tableName}" 已存在`);
            }
            // 创建表
            const tableObj = await db.createTable(tableName, tableStruct);
            // 添加索引
            for (const indexKey of indexKeys) {
                let indexConfig = null;
                switch (indexKey.type) {
                    case 'ivfPq': // 相似度
                        indexConfig = lancedb.Index.ivfPq({
                            distanceType: 'cosine', // 余弦距离
                        });
                        break;
                    case 'btree': // B树 数值和文本索引索引
                        indexConfig = lancedb.Index.btree();
                        break;
                    case 'bitmap': // 位图 如男|女，是|否等
                        indexConfig = lancedb.Index.bitmap();
                        break;
                    case 'labelList': // 标签列表
                        indexConfig = lancedb.Index.labelList();
                        break;
                    case 'fts': // 全文搜索
                        indexConfig = lancedb.Index.fts();
                        break;
                    case 'hnswPq': // hnswPq向量索引
                        indexConfig = lancedb.Index.hnswPq();
                        break;
                    case 'hnswSq': // hnswSq向量索引
                        indexConfig = lancedb.Index.hnswSq();
                        break;
                    default:
                        // 默认使用btree
                        indexConfig = lancedb.Index.btree();
                        break;
                }
                await tableObj.createIndex(indexKey.key, {
                    config: indexConfig
                });
            }
            // logger.info(`成功创建表: ${tableName}`);
            return true;
        }
        catch (error) {
            throw new Error(`创建表失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 创建FTS索引
     * @param tableName 表名
     * @returns boolean
     */
    static async createDocFtsIndex(tableName) {
        try {
            const db = await lancedb.connect(public_1.pub.get_db_path());
            const tableObj = await db.openTable(tableName);
            let indexName = 'doc_idx';
            let indexStats = await tableObj.indexStats(indexName);
            if (indexStats) {
                // 删除旧的FTS索引
                await tableObj.dropIndex(indexName);
            }
            let shcema = await tableObj.schema();
            // 检查是否存在tokens列
            let tokensColumn = shcema.fields.find((col) => col.name === 'tokens');
            if (!tokensColumn) {
                // 如果不存在，添加tokens列
                await tableObj.addColumns([{
                        name: "tokens",
                        valueSql: "cast(doc as string)",
                    }]);
                // 调整tokens列
                let data = await tableObj.query().select(['id', 'doc']).limit(1000000).toArray();
                for (let i = 0; i < data.length; i++) {
                    let doc = data[i].doc;
                    let id = data[i].id;
                    let result = public_1.pub.cutForSearch(doc);
                    let tokens = result.join(' ');
                    await tableObj.update({ where: `id='${id}'`, values: { tokens } });
                }
                await tableObj.optimize();
            }
            // 创建新的FTS索引
            indexName = 'tokens_idx';
            indexStats = await tableObj.indexStats(indexName);
            if (!indexStats) {
                // 创建FTS索引
                await tableObj.createIndex("tokens", {
                    config: lancedb.Index.fts(),
                });
            }
            tableObj.close();
            db.close();
        }
        catch (e) {
            log_1.logger.error('创建FTS索引失败', e);
        }
    }
    /**
     * 添加索引
     * @param tableName 表名
     * @param indexKeys 索引 示例：[{key:'msg',type:'ivfPq'},{key:'docId',type:'btree'}]
     * @returns boolean
     */
    static async addIndex(tableName, indexKeys) {
        const metrics = this.startMetrics(`添加索引到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            // 打开表
            const tableObj = await db.openTable(tableName);
            // 添加索引
            for (const indexKey of indexKeys) {
                // 检查索引是否已存在
                let indexName = indexKey.key + "_idx";
                const indexStats = await tableObj.indexStats(indexName);
                if (indexStats) {
                    log_1.logger.error(`索引 "${indexName}" 已存在，跳过创建`);
                    continue;
                }
                let indexConfig = null;
                switch (indexKey.type) {
                    case 'ivfPq': // 相似度
                        indexConfig = lancedb.Index.ivfPq({
                            distanceType: 'cosine', // 余弦距离
                        });
                        break;
                    case 'btree': // B树 数值和文本索引索引
                        indexConfig = lancedb.Index.btree();
                        break;
                    case 'bitmap': // 位图 如男|女，是|否等
                        indexConfig = lancedb.Index.bitmap();
                        break;
                    case 'labelList': // 标签列表
                        indexConfig = lancedb.Index.labelList();
                        break;
                    case 'fts': // 全文搜索
                        indexConfig = lancedb.Index.fts();
                        break;
                    case 'hnswPq': // hnswPq向量索引
                        indexConfig = lancedb.Index.hnswPq();
                        break;
                    case 'hnswSq': // hnswSq向量索引
                        indexConfig = lancedb.Index.hnswSq();
                        break;
                    default:
                        // 默认使用btree
                        indexConfig = lancedb.Index.btree();
                        break;
                }
                await tableObj.createIndex(indexKey.key, {
                    config: indexConfig
                });
            }
            return true;
        }
        catch (e) {
            log_1.logger.error('添加索引失败', e);
            return false;
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 删除索引
     * @param tableName 表名
     * @param indexKey <string> 索引 key
     * @returns boolean
     */
    static async deleteIndex(tableName, indexKey) {
        const metrics = this.startMetrics(`删除索引到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            // 打开表
            const tableObj = await db.openTable(tableName);
            // 删除索引
            await tableObj.dropIndex(indexKey);
            return true;
        }
        catch (e) {
            log_1.logger.error('删除索引失败', e);
            return false;
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 向表中添加文档
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param text 要添加的文本
     * @returns 添加的记录ID
     */
    static async addDocument(tableName, supplierName, model, text, keywords, docId, tokens) {
        const metrics = this.startMetrics(`添加文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        let db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                await this.createTable(tableName, supplierName, model, text);
                await db.close();
                db = await lancedb.connect(public_1.pub.get_db_path());
            }
            const tableObj = await db.openTable(tableName);
            // 获取文本的嵌入
            const embedding = await this.getEmbedding(supplierName, model, text);
            // 生成新ID
            const id = public_1.pub.uuid();
            // 添加记录
            await tableObj.add([{
                    id,
                    doc: text,
                    docId,
                    keywords,
                    tokens: tokens,
                    vector: embedding
                }]);
            return id;
        }
        catch (error) {
            throw new Error(`添加文档失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    static async checkColumn(tableObj, recordInfo) {
        let schema = await tableObj.schema();
        // 检查字段是否存在
        let newFields = [];
        for (let key of Object.keys(recordInfo)) {
            if (schema.fields.find((item) => item.name == key)) {
                continue;
            }
            // 如果字段不存在，添加字段
            const fieldType = typeof recordInfo[key];
            let newField = {
                name: key,
                valueSql: '',
            };
            if (fieldType == 'string') {
                newField.valueSql = "cast( NULL as Utf8)";
            }
            else if (fieldType == 'number') {
                newField.valueSql = 'cast(NULL as Float)';
            }
            else if (fieldType == 'object') {
                if (Array.isArray(recordInfo[key])) {
                    newField.valueSql = 'cast(["\n\n","。"] as List)';
                }
            }
            newFields.push(newField);
        }
        // 添加字段
        log_1.logger.info('添加字段', newFields);
        await tableObj.addColumns(newFields);
        return true;
    }
    /**
     * 通用添加文档
     * @param tableName 表名
     * @param record 要添加的记录
     * @returns boolean
     */
    static async addRecord(tableName, record) {
        const metrics = this.startMetrics(`添加文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            // 添加记录
            await tableObj.add(record);
            // await tableObj.optimize();
            // logger.info(`成功添加文档到表 ${tableName}`);
            return true;
        }
        catch (error) {
            throw new Error(`添加文档失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    // 打开表
    static async openTable(tableName) {
        const db = await lancedb.connect(public_1.pub.get_db_path());
        return await db.openTable(tableName);
    }
    /**
     * 通用更新文档
     * @param tableName 表名
     * @param record 要更新的记录
     * @returns boolean
     * @example
     * await LanceDBManager.updateRecord('test', { where:'id=1',values:{name:'test1',age:20} });
     */
    static async updateRecord(tableName, record) {
        const metrics = this.startMetrics(`更新文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                return false;
            }
            const tableObj = await db.openTable(tableName);
            // 更新记录
            await tableObj.update(record);
            await tableObj.optimize();
            log_1.logger.info(`成功更新文档到表 ${tableName}`);
            return true;
        }
        catch (error) {
            log_1.logger.error(`更新文档失败: ${error.message}`, tableName, record);
            return false;
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 通用删除文档
     * @param tableName 表名
     * @param where 删除条件
     * @returns boolean
     */
    static async deleteRecord(tableName, where) {
        const metrics = this.startMetrics(`删除文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                return false;
            }
            const tableObj = await db.openTable(tableName);
            // 删除记录
            await tableObj.delete(where);
            await tableObj.optimize();
            // logger.info(`成功删除文档到表 ${tableName}`);
            return true;
        }
        catch (error) {
            log_1.logger.error(`删除文档失败: ${error.message}`);
            return false;
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 通用查询文档
     * @param tableName 表名
     * @param where 查询条件
     * @returns 查询结果
     */
    static async queryRecord(tableName, where, field = []) {
        const metrics = this.startMetrics(`查询文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                return [];
            }
            const tableObj = await db.openTable(tableName);
            // 查询记录
            let query = tableObj.query().where(where).limit(10000);
            if (field.length > 0) {
                query = query.select(field);
            }
            const results = await query.toArray();
            return results;
        }
        catch (error) {
            log_1.logger.error(`查询文档失败: ${error.message}`);
            return [];
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 通用查询指定表的总行数
     * @param tableName 表名
     * @param where 查询条件
     * @returns 查询结果
     */
    static async tableCount(tableName) {
        const metrics = this.startMetrics(`查询文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                return 0;
            }
            const tableObj = await db.openTable(tableName);
            // 查询
            const results = await tableObj.countRows();
            return results;
        }
        catch (error) {
            log_1.logger.error(`查询文档失败: ${error.message}`);
            return 0;
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 批量添加文档
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param texts 文本数组
     * @returns 添加的记录数量
     */
    static async addDocuments(tableName, supplierName, model, texts, keywords, docId) {
        if (!texts.length) {
            return 0;
        }
        const metrics = this.startMetrics(`批量添加 ${texts.length} 条文档到表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            // 优化: 并行处理嵌入生成
            const embeddingPromises = texts.map(text => this.getEmbedding(supplierName, model, text));
            const embeddings = await Promise.all(embeddingPromises);
            // 创建记录数组
            const records = embeddings.map((embedding, index) => ({
                id: public_1.pub.uuid(),
                doc: texts[index],
                docId,
                keywords: keywords[index],
                vector: embedding
            }));
            // 批量添加记录
            await tableObj.add(records);
            await tableObj.optimize();
            // logger.info(`成功批量添加 ${records.length} 条文档到表 ${tableName}`);
            return records.length;
        }
        catch (error) {
            throw new Error(`批量添加文档失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 执行向量搜索
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param queryText 查询文本
     * @param limit 结果数量限制
     * @returns 查询结果
     */
    static async search(tableName, supplierName, model, queryText, limit = 5) {
        const metrics = this.startMetrics(`在表 ${tableName} 中搜索`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            // 获取查询文本的嵌入
            const embedding = await this.getEmbedding(supplierName, model, queryText);
            // 执行向量搜索
            const results = await tableObj
                .search(embedding)
                .limit(limit)
                .select(['id', 'doc', '_distance'])
                .toArray();
            return results.map(item => ({
                id: item.id,
                doc: item.doc,
                score: 1 - item._distance, // 转换距离为相似度分数
                vectorScore: 1 - item._distance,
                keywordScore: 0
            }));
        }
        catch (error) {
            throw new Error(`搜索失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    static async hybridSearchByNew(tableName, ragInfo, queryText, keywords = []) {
        const metrics = this.startMetrics(`在表 ${tableName} 中执行混合搜索`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        const tableObj = await db.openTable(tableName);
        const embedding = await this.getEmbedding(ragInfo.supplierName, ragInfo.embeddingModel, queryText);
        let isTokensIdx = await tableObj.indexStats('tokens_idx');
        if (!isTokensIdx) {
            // 创建FTS索引
            await this.createDocFtsIndex(tableName);
        }
        let sortedResults = await tableObj.query().fullTextSearch(keywords.join(' ')).nearestTo(embedding).rerank(await lancedb.rerankers.RRFReranker.create()).select(['id', 'doc', 'docId', 'tokens']).limit(ragInfo.maxRecall).toArray();
        // 获取文档信息并处理结果
        const docIdList = sortedResults.map(item => item.docId);
        const docNameMap = await this.getDocName(docIdList);
        const optimizedResults = await this.optimizeDocumentContent(sortedResults, docNameMap);
        // 返回标准格式的结果
        const userUrl = `http://127.0.0.1:7071`;
        return this.formatResults(optimizedResults, docNameMap, "{URL}", userUrl);
    }
    /**
     * 执行混合搜索（向量相似度 + 关键词匹配）
     * 优化版本：减少重复计算和数据库查询次数，提升性能
     * @param tableName 表名
     * @param model 使用的模型名称
     * @param queryText 查询文本
     * @param keywords 关键词数组
     * @param limit 结果数量限制
     * @param vectorWeight 向量搜索权重 (0-1)
     * @param keywordWeight 关键词匹配权重 (0-1)
     * @returns 查询结果
     */
    static async hybridSearch(tableName, ragInfo, queryText, keywords = []) {
        const metrics = this.startMetrics(`在表 ${tableName} 中执行优化混合搜索`);
        this.ensureDatabaseDirectory();
        var vectorWeight = ragInfo.vectorWeight;
        var keywordWeight = ragInfo.keywordWeight;
        // 规范化权重
        [vectorWeight, keywordWeight] = this.normalizeWeights(vectorWeight, keywordWeight);
        // 确定搜索策略
        const needVectorSearch = vectorWeight > 0;
        const needKeywordSearch = keywords.length > 0 && keywordWeight > 0;
        // 如果两种搜索都不需要，返回空结果
        if (!needVectorSearch && !needKeywordSearch) {
            return [];
        }
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                // throw new Error(`表 "${tableName}" 不存在`);
                return [];
            }
            const tableObj = await db.openTable(tableName);
            // 预热查询以提高后续查询速度
            await this.preWarmQuery(tableObj);
            // 初始化结果映射
            const resultMap = new Map();
            // 并行执行向量搜索和关键词搜索
            const searchPromises = [];
            if (needVectorSearch) {
                searchPromises.push(this.performVectorSearch(tableObj, ragInfo, queryText, resultMap));
            }
            if (needKeywordSearch) {
                searchPromises.push(this.performKeywordSearch(tableObj, keywords, keywordWeight, resultMap));
            }
            // 等待所有搜索完成
            await Promise.all(searchPromises);
            // 排序并限制结果数量
            const sortedResults = this.sortResults(resultMap, ragInfo.maxRecall);
            // 获取文档信息并处理结果
            const docIdList = sortedResults.map(item => item.docId);
            const docNameMap = await this.getDocName(docIdList);
            // 优化文档内容: 对于切片覆盖大部分原文档的情况，直接使用完整文档
            const optimizedResults = await this.optimizeDocumentContent(sortedResults, docNameMap);
            // 返回标准格式的结果
            const userUrl = `http://127.0.0.1:7071`;
            return this.formatResults(optimizedResults, docNameMap, "{URL}", userUrl);
        }
        catch (error) {
            throw new Error(`混合搜索失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 规范化权重确保它们的总和为1
     */
    static normalizeWeights(vectorWeight, keywordWeight) {
        vectorWeight = Math.max(0, Math.min(1, vectorWeight));
        keywordWeight = Math.max(0, Math.min(1, keywordWeight));
        if (vectorWeight > 0 && keywordWeight > 0) {
            const sum = vectorWeight + keywordWeight;
            return [vectorWeight / sum, keywordWeight / sum];
        }
        return [vectorWeight, keywordWeight];
    }
    /**
     * 预热查询提高性能
     */
    static async preWarmQuery(tableObj) {
        try {
            await tableObj.query().limit(1).toArray();
        }
        catch {
            // 预热失败不影响主流程
        }
    }
    // 当向量数据足够多时，切换到余弦相似度索引
    static async ToCosineIndex(tableName) {
        let indexTipsPath = public_1.pub.get_data_path() + "/rag/index_tips";
        if (!public_1.pub.file_exists(indexTipsPath)) {
            public_1.pub.mkdir(indexTipsPath);
        }
        let indexTipFile = indexTipsPath + "/" + tableName + ".pl";
        if (public_1.pub.file_exists(indexTipFile)) {
            return;
        }
        if (await LanceDBManager.tableCount(tableName) > 256) {
            public_1.pub.write_file(indexTipFile, "1");
            await LanceDBManager.addIndex(tableName, [{ type: 'ivfPq', key: 'vector' }]);
        }
    }
    /**
     * 执行向量搜索
     */
    static async performVectorSearch(tableObj, ragInfo, queryText, resultMap) {
        const metrics = this.startMetrics("执行向量搜索");
        try {
            // 生成查询嵌入
            const embedding = await this.getEmbedding(ragInfo.supplierName, ragInfo.embeddingModel, queryText);
            // 使用更大的限制获取足够的候选结果
            const searchLimit = Math.max(ragInfo.maxRecall * 3, 50);
            // 当向量数据足够多时，切换到余弦相似度索引
            await this.ToCosineIndex(tableObj.name);
            const results = await tableObj
                .search(embedding)
                .limit(searchLimit)
                .select(['id', 'doc', 'docId', '_distance'])
                .toArray();
            const indexTipFile = path.join(public_1.pub.get_data_path(), 'rag', 'index_tips', tableObj.name + ".pl");
            const ivfPq = public_1.pub.file_exists(indexTipFile);
            // 将结果添加到映射
            for (const result of results) {
                const id = result.id;
                const doc = result.doc;
                const distance = result._distance;
                const score = 1 - distance; // 转换距离为相似度
                const docId = result.docId;
                // 召回率优化
                if (ivfPq && score <= ragInfo.recallAccuracy) {
                    continue;
                }
                if (!ivfPq && distance > 600) {
                    continue;
                }
                resultMap.set(id, {
                    id,
                    doc,
                    docId,
                    vectorScore: score,
                    keywordScore: 0,
                    score: score * ragInfo.vectorWeight
                });
            }
        }
        finally {
            this.endMetrics(metrics);
        }
    }
    /**
     * 执行关键词搜索
     */
    static async performKeywordSearch(tableObj, keywords, keywordWeight, resultMap) {
        const metrics = this.startMetrics("执行关键词搜索");
        try {
            // 预处理关键词为小写
            const processedKeywords = keywords.map(k => k.toLowerCase());
            // 构建优化的关键词查询条件
            const keywordConditions = this.buildKeywordConditions(processedKeywords);
            // 执行关键词查询
            const results = await tableObj
                .query()
                .where(keywordConditions)
                .select(['id', 'doc', 'docId'])
                .toArray();
            // 创建文档缓存来避免重复转换
            const docCache = new Map();
            for (const result of results) {
                const id = result.id;
                const doc = result.doc;
                const docId = result.docId;
                // 计算关键词匹配分数
                const keywordScore = this.calculateKeywordScore(doc, processedKeywords, docCache);
                if (resultMap.has(id)) {
                    // 更新已存在的结果
                    const existing = resultMap.get(id);
                    existing.keywordScore = keywordScore;
                    existing.score = existing.vectorScore * (1 - keywordWeight) + keywordScore * keywordWeight;
                }
                else {
                    // 添加新结果
                    resultMap.set(id, {
                        id,
                        doc,
                        docId,
                        vectorScore: 0,
                        keywordScore,
                        score: keywordScore * keywordWeight
                    });
                }
            }
        }
        finally {
            this.endMetrics(metrics);
        }
    }
    /**
     * 构建关键词查询条件
     */
    static buildKeywordConditions(keywords) {
        if (keywords.length === 1) {
            return `doc LIKE '%${keywords[0].replace(/'/g, "''")}%'`;
        }
        return keywords
            .map(kw => `doc LIKE '%${kw.replace(/'/g, "''")}%'`)
            .join(' OR ');
    }
    /**
     * 计算关键词匹配分数
     * 优先考虑匹配的关键词数量，其次考虑关键词出现的总次数
     */
    static calculateKeywordScore(doc, keywords, docCache) {
        // 缓存文档的小写版本以避免重复转换
        if (!docCache.has(doc)) {
            docCache.set(doc, doc.toLowerCase());
        }
        const lowerDoc = docCache.get(doc);
        // 匹配的唯一关键词数
        const matchedKeywords = new Set();
        // 关键词的总匹配次数
        let totalOccurrences = 0;
        // 位置加权
        let positionBonus = 0;
        for (const keyword of keywords) {
            let position = lowerDoc.indexOf(keyword);
            let keywordOccurrences = 0;
            // 计算该关键词的所有出现次数和最佳位置
            while (position !== -1) {
                keywordOccurrences++;
                // 记录首次出现的位置加权
                if (matchedKeywords.has(keyword) === false) {
                    positionBonus += Math.max(0, 1 - (position / 100));
                    matchedKeywords.add(keyword);
                }
                position = lowerDoc.indexOf(keyword, position + 1);
            }
            totalOccurrences += keywordOccurrences;
        }
        if (keywords.length === 0)
            return 0;
        // 主要权重给匹配的唯一关键词比例(70%)
        const uniqueMatchScore = matchedKeywords.size / keywords.length;
        // 次要权重给总出现次数相对于可能的最大出现次数(20%)
        // 最大可能出现次数 = 关键词数量 * 一个经验常数(取5)表示每个关键词的平均预期出现次数
        const occurrenceScore = Math.min(1, totalOccurrences / (keywords.length * 5));
        // 小部分权重给位置加权(10%)
        const normalizedPositionBonus = positionBonus / Math.max(1, keywords.length);
        // 组合分数
        return uniqueMatchScore * 0.7 + occurrenceScore * 0.2 + normalizedPositionBonus * 0.1;
    }
    /**
     * 排序结果并限制数量
     */
    static sortResults(resultMap, limit) {
        return Array.from(resultMap.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    /**
     * 优化文档内容 - 对切片长度接近原文的情况使用完整文档
     */
    static async optimizeDocumentContent(results, docNameMap) {
        // 计算文档切片的总长度
        const docChunkLength = new Map();
        results.forEach(result => {
            const docId = result.docId;
            const length = result.doc.length;
            docChunkLength.set(docId, (docChunkLength.get(docId) || 0) + length);
        });
        // 对比长度并决定是否使用完整文档
        const usedDocId = new Map();
        for (const [docId, totalLength] of docChunkLength.entries()) {
            const docInfo = docNameMap.get(docId);
            if (docInfo && docInfo.doc.length * 0.1 < totalLength) {
                usedDocId.set(docId, docInfo.doc);
            }
        }
        // 替换文档内容
        if (usedDocId.size > 0) {
            for (let i = 0; i < results.length; i++) {
                const docId = results[i].docId;
                if (usedDocId.has(docId)) {
                    results[i].doc = usedDocId.get(docId);
                    results[i].id = docId;
                }
            }
            // 去除重复的ID
            const uniqueId = new Set();
            results = results.filter(item => {
                if (uniqueId.has(item.id)) {
                    return false;
                }
                uniqueId.add(item.id);
                return true;
            });
        }
        return results;
        // // 合并同一文档的多个切片
        // const resultsMap = new Map<string, any>();
        // results.forEach(result => {
        //     const docId = result.docId;
        //     if (!resultsMap.has(docId)) {
        //         resultsMap.set(docId, result);
        //     } else {
        //         const existing = resultsMap.get(docId);
        //         existing.doc += "\n" + result.doc;
        //         existing.score = Math.max(existing.score, result.score);
        //     }
        // });
        // return Array.from(resultsMap.values());
    }
    /**
     * 格式化结果为标准输出格式
     */
    static formatResults(results, docNameMap, repURL, userUrl) {
        return results.map(item => {
            // 获取文档内容
            let docContent = item.doc || '';
            // 只有当文档包含替换URL时才执行替换
            if (docContent.includes(repURL)) {
                docContent = docContent.replace(new RegExp(repURL, 'g'), userUrl);
            }
            return {
                id: item.id,
                doc: docContent,
                docId: item.docId,
                docName: docNameMap.get(item.docId)?.doc_name,
                docFile: docNameMap.get(item.docId)?.doc_file,
                tokens: item.tokens,
                score: item.score !== undefined ? item._score : item._score + item._relevance_score,
                vectorScore: item.vectorScore !== undefined ? item.vectorScore : item._relevance_score,
                keywordScore: item.keywordScore !== undefined ? item.keywordScore : item._score
            };
        });
    }
    /**
     * 获取文档信息
     * @param docIdList - 文档ID列表
     * @returns 文档ID到文档名称的映射
     */
    static async getDocName(docIdList) {
        // 空数组快速返回
        if (!docIdList || docIdList.length === 0) {
            return new Map();
        }
        const metrics = this.startMetrics(`获取${docIdList.length}个文档名称`);
        const result = new Map();
        const dataDir = public_1.pub.get_data_path();
        const repDataDir = '{DATA_DIR}';
        try {
            this.ensureDatabaseDirectory();
            const db = await lancedb.connect(public_1.pub.get_db_path());
            try {
                // 检查表是否存在
                if (!(await this.tableExists(db, 'doc_table'))) {
                    return result;
                }
                // 打开表
                const tableObj = await db.openTable('doc_table');
                // 优化: 去重ID列表，避免重复查询
                const uniqueDocIds = [...new Set(docIdList)];
                // 使用批处理方式处理大量ID
                const batchSize = 10; // 每批处理的ID数量
                for (let i = 0; i < uniqueDocIds.length; i += batchSize) {
                    const batch = uniqueDocIds.slice(i, i + batchSize);
                    // 为每批创建OR条件
                    const orConditions = batch.map(id => `doc_id='${id}'`).join(' OR ');
                    if (orConditions) {
                        const results = await tableObj.query()
                            .where(orConditions)
                            .select(['doc_id', 'doc_name', 'md_file'])
                            .toArray();
                        results.forEach((item) => {
                            let docFile = item.md_file.replace(repDataDir, dataDir);
                            result.set(item.doc_id, { doc_name: item.doc_name, doc_file: docFile, doc: public_1.pub.read_file(docFile) });
                        });
                    }
                }
            }
            finally {
                await db.close();
            }
        }
        catch (error) {
            log_1.logger.error(`获取文档名称失败: ${error.message}`);
        }
        finally {
            this.endMetrics(metrics);
        }
        return result;
    }
    /**
     * 获取表中的所有文档
     * @param tableName 表名
     * @returns 表中的所有文档
     */
    static async getAllDocuments(tableName) {
        const metrics = this.startMetrics(`获取表 ${tableName} 的所有文档`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            // 获取所有记录
            const results = await tableObj
                .query()
                .select(['id', 'doc'])
                .toArray();
            return results.map(item => ({
                id: item.id,
                doc: item.doc
            }));
        }
        catch (error) {
            throw new Error(`获取所有文档失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 获取表中的记录数量
     * @param tableName 表名
     * @returns 记录数量
     */
    static async getDocumentCount(tableName) {
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            return await tableObj.countRows();
        }
        catch (error) {
            throw new Error(`获取记录数量失败: ${error.message}`);
        }
        finally {
            await db.close();
        }
    }
    /**
     * 删除表
     * @param tableName 表名
     * @returns 成功与否
     */
    static async dropTable(tableName) {
        const metrics = this.startMetrics(`删除表 ${tableName}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                return false;
            }
            // 删除表
            await db.dropTable(tableName);
            return true;
        }
        catch (error) {
            if (error.message.includes('LanceError(IO)')) {
                // 通过删除表文件来解决IO错误
                const tablePath = path.join(public_1.pub.get_db_path(), `${tableName}.lance`);
                if (fs.existsSync(tablePath)) {
                    fs.rmdirSync(tablePath, { recursive: true });
                    return true;
                }
            }
            throw new Error(`删除表失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 获取所有表名
     * @returns 所有表名列表
     */
    static async listTables() {
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            return await db.tableNames();
        }
        catch (error) {
            throw new Error(`获取表列表失败: ${error.message}`);
        }
        finally {
            await db.close();
        }
    }
    /**
     * 从表中删除指定ID的文档
     * @param tableName 表名
     * @param docId 文档ID
     * @returns 成功删除的记录数
     */
    static async deleteDocument(tableName, docId) {
        const metrics = this.startMetrics(`从表 ${tableName} 中删除文档 ID: ${docId}`);
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            // 确认记录存在
            const where = "`docId` = '" + docId + "'";
            const exists = (await tableObj
                .query()
                .where(where)
                .select(['docId'])
                .limit(1)
                .toArray()).length > 0;
            if (!exists) {
                return 0;
            }
            // 删除记录
            await tableObj.delete(where);
            // logger.info(`从表 ${tableName} 中删除ID为 ${docId} 的文档`);
            return 1;
        }
        catch (error) {
            throw new Error(`删除文档失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
    /**
     * 获取数据库状态信息
     * @returns 数据库状态信息
     */
    static async getDatabaseStats() {
        this.ensureDatabaseDirectory();
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            const tableNames = await db.tableNames();
            const tableDetails = [];
            let totalDocuments = 0;
            // 获取每个表的文档数
            for (const name of tableNames) {
                const table = await db.openTable(name);
                const count = await table.countRows();
                totalDocuments += count;
                tableDetails.push({ name, documents: count });
            }
            return {
                dbPath: public_1.pub.get_db_path(),
                tables: tableNames.length,
                totalDocuments,
                tableDetails
            };
        }
        catch (error) {
            throw new Error(`获取数据库统计失败: ${error.message}`);
        }
        finally {
            await db.close();
        }
    }
    /**
   * 执行高级关键词搜索
   * 通过文本分析和标记化提供更精确的关键词匹配
   * @param tableName 表名
   * @param keywords 关键词数组
   * @param options 搜索选项
   * @returns 搜索结果
   */
    static async keywordSearch(tableName, keywords, options = {}) {
        const metrics = this.startMetrics(`在表 ${tableName} 中执行关键词搜索`);
        this.ensureDatabaseDirectory();
        const { limit = 5, matchMode = 'any', caseSensitive = false, fuzzyMatch = false } = options;
        if (!keywords.length) {
            return [];
        }
        const db = await lancedb.connect(public_1.pub.get_db_path());
        try {
            // 检查表是否存在
            if (!(await this.tableExists(db, tableName))) {
                throw new Error(`表 "${tableName}" 不存在`);
            }
            const tableObj = await db.openTable(tableName);
            // 预处理关键词
            const processedKeywords = caseSensitive
                ? keywords
                : keywords.map(k => k.toLowerCase());
            // 构建SQL查询条件
            let whereClause = '';
            switch (matchMode) {
                case 'all':
                    // 所有关键词都必须匹配（AND条件）
                    whereClause = processedKeywords
                        .map(kw => {
                        const escaped = kw.replace(/'/g, "''");
                        return caseSensitive
                            ? `doc LIKE '%${escaped}%'`
                            : `LOWER(doc) LIKE '%${escaped}%'`;
                    })
                        .join(' AND ');
                    break;
                case 'phrase':
                    // 精确短语匹配
                    const phrase = processedKeywords.join(' ');
                    whereClause = caseSensitive
                        ? `doc LIKE '%${phrase.replace(/'/g, "''")}%'`
                        : `LOWER(doc) LIKE '%${phrase.replace(/'/g, "''")}%'`;
                    break;
                case 'any':
                default:
                    // 任何关键词匹配即可（OR条件）
                    whereClause = processedKeywords
                        .map(kw => {
                        const escaped = kw.replace(/'/g, "''");
                        return caseSensitive
                            ? `doc LIKE '%${escaped}%'`
                            : `LOWER(doc) LIKE '%${escaped}%'`;
                    })
                        .join(' OR ');
                    break;
            }
            // 如果启用模糊匹配，添加额外的LIKE条件
            if (fuzzyMatch) {
                const fuzzyConditions = processedKeywords
                    .filter(kw => kw.length > 3) // 只对长度>3的关键词进行模糊匹配
                    .map(kw => {
                    // 创建两种模糊匹配模式：
                    // 1. 关键词的前3个字符 + %（前缀匹配）
                    // 2. % + 关键词的后3个字符（后缀匹配）
                    const prefix = kw.substring(0, 3).replace(/'/g, "''");
                    const suffix = kw.substring(kw.length - 3).replace(/'/g, "''");
                    return caseSensitive
                        ? `(doc LIKE '${prefix}%' OR doc LIKE '%${suffix}')`
                        : `(LOWER(doc) LIKE '${prefix}%' OR LOWER(doc) LIKE '%${suffix}')`;
                });
                if (fuzzyConditions.length > 0) {
                    whereClause = `(${whereClause}) OR (${fuzzyConditions.join(' OR ')})`;
                }
            }
            // 执行查询
            const results = await tableObj
                .query()
                .where(whereClause)
                .select(['id', 'doc'])
                .toArray();
            // 进行更精确的关键词评分
            const scoredResults = results.map(result => {
                const id = result.id;
                const doc = result.doc;
                // 用于匹配的文档文本
                const matchDoc = caseSensitive ? doc : doc.toLowerCase();
                // 计算匹配分数
                let score = 0;
                let matchedKeywords = 0;
                let exactMatchBonus = 0;
                let proximityBonus = 0;
                // 评分过程
                for (const keyword of processedKeywords) {
                    // 检查关键词是否出现
                    const keywordIndex = matchDoc.indexOf(keyword);
                    if (keywordIndex !== -1) {
                        matchedKeywords++;
                        // 1. 位置加分：关键词出现在文档开头会获得加分
                        const positionScore = Math.max(0, 1 - (keywordIndex / 200));
                        // 2. 精确匹配加分：独立的关键词（前后有空格或标点）获得额外加分
                        const beforeChar = keywordIndex > 0 ? matchDoc[keywordIndex - 1] : ' ';
                        const afterChar = keywordIndex + keyword.length < matchDoc.length
                            ? matchDoc[keywordIndex + keyword.length]
                            : ' ';
                        const isExactMatch = /[\s.,;!?()]/.test(beforeChar) && /[\s.,;!?()]/.test(afterChar);
                        exactMatchBonus += isExactMatch ? 0.5 : 0;
                        // 3. 计算本关键词总分
                        score += 1 + positionScore + (isExactMatch ? 0.5 : 0);
                        // 4. 检查关键词间的近邻关系（只在多个关键词时有效）
                        if (processedKeywords.length > 1) {
                            const nextKeyword = processedKeywords.find(k => k !== keyword && matchDoc.includes(k));
                            if (nextKeyword) {
                                const nextIndex = matchDoc.indexOf(nextKeyword);
                                const distance = Math.abs(keywordIndex - nextIndex);
                                // 如果两个关键词距离小于20个字符，给予近邻加分
                                if (distance < 20) {
                                    proximityBonus += 0.3 * (1 - distance / 20);
                                }
                            }
                        }
                    }
                }
                // 计算最终得分（根据匹配模式）
                let finalScore = 0;
                if (matchMode === 'all') {
                    // 所有关键词必须匹配才能获得分数
                    finalScore = matchedKeywords === processedKeywords.length
                        ? (score / processedKeywords.length) + exactMatchBonus + proximityBonus
                        : 0;
                }
                else if (matchMode === 'phrase') {
                    // 短语匹配：整个短语必须存在
                    const phrase = processedKeywords.join(' ');
                    finalScore = matchDoc.includes(phrase)
                        ? 1 + (matchDoc.indexOf(phrase) < 100 ? 0.5 : 0)
                        : 0.1 * (matchedKeywords / processedKeywords.length);
                }
                else {
                    // 任何匹配：匹配的关键词越多越好
                    finalScore = (matchedKeywords / processedKeywords.length) +
                        (exactMatchBonus / processedKeywords.length) +
                        proximityBonus;
                }
                return {
                    id,
                    doc,
                    score: finalScore,
                    vectorScore: 0,
                    keywordScore: finalScore
                };
            });
            // 过滤掉得分为0的结果，然后排序并返回
            const filteredResults = scoredResults
                .filter(r => r.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
            // logger.info(`关键词搜索完成，找到 ${filteredResults.length} 条结果，匹配模式: ${matchMode}`);
            return filteredResults;
        }
        catch (error) {
            throw new Error(`关键词搜索失败: ${error.message}`);
        }
        finally {
            await db.close();
            this.endMetrics(metrics);
        }
    }
}
exports.LanceDBManager = LanceDBManager;
//# sourceMappingURL=vector_lancedb.js.map