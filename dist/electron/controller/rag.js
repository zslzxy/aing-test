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
const public_1 = require("../class/public");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const rag_1 = require("../rag/rag");
const vector_lancedb_1 = require("../rag/vector_database/vector_lancedb");
const model_1 = require("../service/model");
const ollama_1 = require("../service/ollama");
const rag_task_1 = require("../rag/rag_task");
/**
 * rag controller 类，负责管理知识库的相关操作
 * @class
 */
class RagController {
    /**
     * 获取知识库状态
     * @returns {Promise<any>} - 知识库状态
     */
    async rag_status() {
        try {
            // 检查是否有嵌套模型
            let result = await (0, model_1.GetSupplierEmbeddingModels)();
            if (Object.keys(result).length > 0) {
                return public_1.pub.return_success(public_1.pub.lang('知识库组件正常'));
            }
            let ollamaResult = await ollama_1.ollamaService.get_embedding_model_list();
            if (ollamaResult.length > 0) {
                return public_1.pub.return_success(public_1.pub.lang('知识库组件正常'));
            }
            return public_1.pub.return_error(public_1.pub.lang('请选安装或接入嵌入模型'));
        }
        catch (e) {
            return public_1.pub.return_error(public_1.pub.lang('请选安装或接入嵌入模型'), e.message);
        }
    }
    /**
     * 获取嵌套模型列表
     * @returns {Promise<any>} - 嵌套模型列表
     */
    async get_embedding_models() {
        let result = await (0, model_1.GetSupplierEmbeddingModels)();
        result['ollama'] = await ollama_1.ollamaService.get_embedding_model_list();
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), result);
    }
    /**
     * 创建知识库
     * @param {string} ragName - 知识库名称
     * @param {string} ragDesc - 知识库描述
     * @returns {Promise<any>} - 创建结果
     */
    async create_rag(args) {
        let { ragName, ragDesc, enbeddingModel, supplierName, searchStrategy, maxRecall, recallAccuracy, resultReordering, rerankModel, queryRewrite, vectorWeight, keywordWeight } = args;
        if (!searchStrategy)
            searchStrategy = 2;
        if (!maxRecall)
            maxRecall = 5;
        if (!recallAccuracy)
            recallAccuracy = 0.1;
        if (!resultReordering)
            resultReordering = 1;
        if (!rerankModel)
            rerankModel = '';
        if (!queryRewrite)
            queryRewrite = 0;
        if (!vectorWeight)
            vectorWeight = 0.7;
        if (!keywordWeight)
            keywordWeight = 0.3;
        // 检查参数
        if (!ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (ragName == 'vector_db') {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为vector_db'));
        }
        if (!enbeddingModel) {
            enbeddingModel = 'bge-m3:latest';
        }
        if (!supplierName) {
            supplierName = 'ollama';
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + ragName;
        // 检查知识库是否存在
        if (public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('指定知识库名称已存在'));
        }
        // 创建知识库目录
        public_1.pub.mkdir(ragPath);
        // 创建知识库描述文件
        const ragDescFile = ragPath + "/config.json";
        let pdata = {
            ragName: ragName, // 知识库名称
            ragDesc: ragDesc, // 知识库描述
            ragCreateTime: public_1.pub.time(), // 创建时间
            supplierName: supplierName, // 嵌套模型供应商名称
            embeddingModel: enbeddingModel, // 嵌套模型
            searchStrategy: searchStrategy, // 检索策略 1=混合检索 2=向量检索 3=全文检索 
            maxRecall: maxRecall, // 最大召回数
            recallAccuracy: recallAccuracy, // 召回精度
            resultReordering: resultReordering, // 结果重排序 1=开启 0=关闭  PS: 目前仅语义重排
            rerankModel: rerankModel, // 重排序模型 PS: 未实现
            queryRewrite: queryRewrite, // 查询重写 1=开启 0=关闭   PS: 未实现
            vectorWeight: vectorWeight, // 向量权重
            keywordWeight: keywordWeight, // 关键词权重
        };
        public_1.pub.write_file(ragDescFile, JSON.stringify(pdata, null, 4));
        // 创建知识库原始文件目录
        public_1.pub.mkdir(ragPath + "/source");
        // 创建知识库markdown文件目录
        public_1.pub.mkdir(ragPath + "/markdown");
        // 创建图片目录
        public_1.pub.mkdir(ragPath + "/images");
        return public_1.pub.return_success(public_1.pub.lang('知识库创建成功'));
    }
    /**
     * 删除知识库
     * @param {string} ragName - 知识库名称
     * @returns {Promise<any>} - 删除结果
     */
    async remove_rag(args) {
        // logger.info("delete rag");
        if (args.ragName == 'vector_db') {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为vector_db'));
        }
        // 检查参数
        if (!args.ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + args.ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        // 删除知识库所有文档和向量索引
        let ragObj = new rag_1.Rag();
        ragObj.removeRag(args.ragName);
        // 删除知识库文件
        public_1.pub.rmdir(ragPath);
        // 删除知识库索引标记
        const indexTipFile = path.join(public_1.pub.get_data_path(), 'rag', 'index_tips', public_1.pub.md5(args.ragName) + ".pl");
        if (public_1.pub.file_exists(indexTipFile)) {
            fs.unlinkSync(indexTipFile);
        }
        return public_1.pub.return_success(public_1.pub.lang('知识库删除成功'));
    }
    /**
     * 获取嵌套模型MAP
     * @returns {Promise<any>} - 嵌套
     */
    async get_embedding_map() {
        let ollamaEmbeddingList = await ollama_1.ollamaService.get_embedding_model_list();
        let supplierEmbeddingList = await (0, model_1.GetSupplierEmbeddingModels)();
        let embeddingMap = new Map();
        let ollamaEmbeddingMap = new Map();
        for (let embed of ollamaEmbeddingList) {
            ollamaEmbeddingMap.set(embed.model, true);
        }
        embeddingMap.set('ollama', ollamaEmbeddingMap);
        for (let supplierTitle in supplierEmbeddingList) {
            let supplierEmbeddingMap = new Map();
            let supplierName = '';
            for (let embed of supplierEmbeddingList[supplierTitle]) {
                supplierName = embed.supplierName;
                supplierEmbeddingMap.set(embed.model, true);
            }
            if (!supplierName)
                supplierName = supplierTitle;
            embeddingMap.set(supplierName, supplierEmbeddingMap);
        }
        return embeddingMap;
    }
    /**
     * 获取知识库列表
     * @returns {Promise<any>} - 知识库列表
     */
    async get_rag_list() {
        // logger.info("get rag list");
        // 获取知识库列表
        const ragPathList = public_1.pub.readdir(public_1.pub.get_rag_path());
        const embeddingMap = await this.get_embedding_map();
        const ragList = [];
        for (const ragPath of ragPathList) {
            const ragDescFile = ragPath + "/config.json";
            if (public_1.pub.file_exists(ragDescFile)) {
                const ragDesc = JSON.parse(public_1.pub.read_file(ragDescFile));
                // 补全缺失字段
                if (!ragDesc.vectorWeight) {
                    ragDesc.ragCreateTime = public_1.pub.time(); // 创建时间
                    ragDesc.embeddingModel = 'bge-m3:latest'; // 嵌套模型
                    ragDesc.searchStrategy = 1; // 检索策略 1=混合检索 2=向量检索 3=全文检索
                    ragDesc.maxRecall = 5; // 最大召回数
                    ragDesc.recallAccuracy = 0.1; // 召回精度
                    ragDesc.resultReordering = 1; // 结果重排序 1=开启 0=关闭 PS: 目前仅语义重排
                    ragDesc.rerankModel = ''; // 重排序模型 PS: 未实现
                    ragDesc.queryRewrite = 0; // 查询重写 1=开启 0=关闭 PS: 未实现
                    ragDesc.vectorWeight = 0.7; // 向量权重
                    ragDesc.keywordWeight = 0.3; // 关键词权重
                    // 重新写入文件
                    public_1.pub.write_file(ragDescFile, JSON.stringify(ragDesc, null, 4));
                }
                if (!ragDesc.supplierName) {
                    ragDesc.supplierName = 'ollama';
                    public_1.pub.write_file(ragDescFile, JSON.stringify(ragDesc, null, 4));
                }
                ragDesc.embeddingModelExist = true;
                ragDesc.errorMsg = '';
                let supplierMap = embeddingMap.get(ragDesc.supplierName);
                if (!supplierMap || !supplierMap.get(ragDesc.embeddingModel)) {
                    ragDesc.embeddingModelExist = false;
                    ragDesc.errorMsg = public_1.pub.lang('指定嵌入模型不存在: {}', ragDesc.embeddingModel);
                }
                ragList.push(ragDesc);
            }
        }
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), ragList);
    }
    /**
     * 修改知识库信息
     * @param {string} args.ragName - 知识库名称
     * @param {string} args.ragDesc - 知识库描述
     * @param {object} args.options - 其他选项
     * @returns {Promise<any>} - 修改结果
     */
    async modify_rag(args) {
        let { ragName, ragDesc, searchStrategy, maxRecall, recallAccuracy, resultReordering, rerankModel, queryRewrite, vectorWeight, keywordWeight } = args;
        // 检查参数
        if (!ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (ragName == 'vector_db') {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为vector_db'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        const ragDescFile = ragPath + "/config.json";
        let ragConfig = public_1.pub.read_json(ragDescFile);
        ragConfig.ragDesc = ragDesc;
        ragConfig.searchStrategy = searchStrategy == undefined ? ragConfig.searchStrategy : searchStrategy;
        ragConfig.maxRecall = maxRecall == undefined ? ragConfig.maxRecall : maxRecall;
        ragConfig.recallAccuracy = recallAccuracy == undefined ? ragConfig.recallAccuracy : recallAccuracy;
        ragConfig.resultReordering = resultReordering == undefined ? ragConfig.resultReordering : resultReordering;
        ragConfig.rerankModel = rerankModel == undefined ? ragConfig.rerankModel : rerankModel;
        ragConfig.queryRewrite = queryRewrite == undefined ? ragConfig.queryRewrite : queryRewrite;
        ragConfig.vectorWeight = vectorWeight == undefined ? ragConfig.vectorWeight : vectorWeight;
        ragConfig.keywordWeight = keywordWeight == undefined ? ragConfig.keywordWeight : keywordWeight;
        public_1.pub.write_file(ragDescFile, JSON.stringify(ragConfig, null, 4));
        return public_1.pub.return_success(public_1.pub.lang('知识库修改成功'));
    }
    /**
     * 上传知识库文档
     * @param {string} ragName - 知识库名称
     * @param {string} filePath - 文件路径 JSON列表
     * @returns {Promise<any>} - 上传结果
     */
    async upload_doc(args) {
        let { ragName, filePath, separators, chunkSize, overlapSize } = args;
        // 检查参数
        if (!ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (ragName == 'vector_db') {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为vector_db'));
        }
        if (!filePath) {
            return public_1.pub.return_error(public_1.pub.lang('文件路径不能为空'));
        }
        let filePathList = [];
        if (filePath.startsWith('[') && filePath.endsWith(']')) {
            filePathList = JSON.parse(filePath);
        }
        else {
            filePathList = filePath.split(',');
        }
        if (filePathList.length == 0) {
            return public_1.pub.return_error(public_1.pub.lang('文件路径列表不能为空'));
        }
        if (!separators) {
            separators = [];
        }
        if (!chunkSize) {
            chunkSize = 1000;
        }
        if (!overlapSize) {
            overlapSize = 100;
        }
        if (typeof separators == 'string') {
            separators = [separators];
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        // 将separators、chunkSize、overlapSize写入知识库配置文件
        const ragDescFile = ragPath + "/config.json";
        if (!public_1.pub.file_exists(ragDescFile)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库配置文件不存在'));
        }
        let ragConfig = public_1.pub.read_json(ragDescFile);
        ragConfig.separators = separators;
        ragConfig.chunkSize = chunkSize;
        ragConfig.overlapSize = overlapSize;
        public_1.pub.write_json(ragDescFile, ragConfig);
        let ragObj = new rag_1.Rag();
        // 遍历文件列表
        for (const srcFile of filePathList) {
            // 检查文件是否存在
            if (!public_1.pub.file_exists(srcFile)) {
                return public_1.pub.return_error(public_1.pub.lang('文件不存在'));
            }
            const fileName = path.basename(srcFile);
            // 保存目录
            let dstFile = `${ragPath}/source/${fileName}`;
            // 如果同名文件已经存在，则在文件名后面加上编号
            let i = 1;
            while (public_1.pub.file_exists(dstFile)) {
                dstFile = `${ragPath}/source/${path.basename(srcFile, path.extname(srcFile))}_${i}${path.extname(srcFile)}`;
                i++;
            }
            // 复制文件到知识库目录，不复制文件属性
            fs.writeFileSync(dstFile, fs.readFileSync(srcFile));
            await ragObj.addDocumentToDB(dstFile, ragName, separators, chunkSize, overlapSize);
        }
        return public_1.pub.return_success(public_1.pub.lang('文件上传成功'));
    }
    /**
     * 获取知识库文档列表
     * @param {string} ragName - 知识库名称
     * @returns {Promise<any>} - 文件列表
     */
    async get_rag_doc_list(args) {
        // logger.info("get rag file list");
        // 检查参数
        if (!args.ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + args.ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        let result = await vector_lancedb_1.LanceDBManager.queryRecord("doc_table", "doc_rag='" + args.ragName + "'");
        return public_1.pub.return_success(public_1.pub.lang('获取成功'), result);
    }
    /**
     * 获取知识库文档内容
     * @param {string} ragName - 知识库名称
     * @param {string} docName - 文档名称
     * return {Promise<any>} - 文档内容
     */
    async get_doc_content(args) {
        let mdFile = public_1.pub.get_data_path() + "/rag/" + args.ragName + "/markdown/" + args.docName + ".md";
        if (public_1.pub.file_exists(mdFile)) {
            let content = public_1.pub.read_file(mdFile);
            content = content.replace(/{URL}/g, 'http://127.0.0.1:7071');
            return public_1.pub.return_success(public_1.pub.lang('获取成功'), content);
        }
        return public_1.pub.return_error(public_1.pub.lang('文档不存在'));
    }
    /**
     * 下载知识库文档
     * @param {string} ragName - 知识库名称
     * @param {string} docName - 文档名称
     * @returns {Promise<any>} - 文件下载流
     */
    async download_doc(args, event) {
        // 检查参数
        if (!args.ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (!args.docName) {
            return public_1.pub.return_error(public_1.pub.lang('文档名称不能为空'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + args.ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        // 检查文档是否存在
        const docFile = ragPath + "/source/" + args.docName;
        if (!public_1.pub.file_exists(docFile)) {
            return public_1.pub.return_error(public_1.pub.lang('文档不存在'));
        }
        // 设置响应头
        event.response.set('Content-Type', 'application/octet-stream');
        // 设置下载文件名
        let filename = encodeURIComponent(args.docName);
        event.response.set('Content-Disposition', `attachment; filename="${filename}"`);
        // 返回文件流
        const stream = fs.createReadStream(docFile);
        return stream;
    }
    async remove_doc(args) {
        // 检查参数
        if (!args.ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (!args.docIdList) {
            return public_1.pub.return_error(public_1.pub.lang('文档名称不能为空'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + args.ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        let docList = JSON.parse(args.docIdList);
        if (docList.length == 0) {
            return public_1.pub.return_error(public_1.pub.lang('文档名称列表不能为空'));
        }
        let ragObj = new rag_1.Rag();
        // 遍历文件列表
        for (const docId of docList) {
            // 获取docName
            let docName = await ragObj.getDocNameByDocId(docId);
            if (!docName) {
                return public_1.pub.return_error(public_1.pub.lang('文档不存在'));
            }
            // 检查文件是否存在
            const docFile = ragPath + "/source/" + docName;
            if (!public_1.pub.file_exists(docFile)) {
                return public_1.pub.return_error(public_1.pub.lang('文档不存在'));
            }
            // 删除文件
            fs.unlinkSync(docFile);
            // 删除markdown文件
            const mdFile = ragPath + "/markdown/" + docName + ".md";
            if (public_1.pub.file_exists(mdFile)) {
                fs.unlinkSync(mdFile);
            }
            // 删除数据库记录
            await ragObj.removeRagDocument(args.ragName, docId);
        }
        return public_1.pub.return_success(public_1.pub.lang('文档删除成功'));
    }
    // /**
    //  * 修改文档名称
    //  * @param {string} ragName - 知识库名称
    //  * @param {string} docName - 文档名称
    //  * @param {string} newDocName - 新文档名称
    //  */
    // async modify_rag_file_name(args: { ragName:string, docName:string, newDocName:string}): Promise<any> {
    //     logger.info("modify rag file name");
    //     // 检查参数
    //     if (!args.ragName) {
    //         return pub.return_error(pub.lang('知识库名称不能为空'));
    //     }
    //     if (!args.docName) {
    //         return pub.return_error(pub.lang('文档名称不能为空'));
    //     }
    //     if (!args.newDocName) {
    //         return pub.return_error(pub.lang('新文档名称不能为空'));
    //     }
    //     // 知识库保存路径
    //     const ragPath = pub.get_rag_path() + "/" + args.ragName;
    //     // 检查知识库是否存在
    //     if (!pub.file_exists(ragPath)) {
    //         return pub.return_error(pub.lang('知识库不存在'));
    //     }
    //     // 检查文档是否存在
    //     const docFile = ragPath + "/source/" + args.docName;
    //     if (!pub.file_exists(docFile)) {
    //         return pub.return_error(pub.lang('文档不存在'));
    //     }
    //     // 修改文档名称
    //     const newDocFile = ragPath + "/source/" + args.newDocName;
    //     fs.renameSync(docFile, newDocFile);
    //     // 修改markdown文件名称
    //     const mdFile = ragPath + "/markdown/" + path.basename(args.docName) + ".md";
    //     const newMdFile = ragPath + "/markdown/" + path.basename(args.newDocName) + ".md";
    //     if (pub.file_exists(mdFile)) {
    //         fs.renameSync(mdFile, newMdFile);
    //     }
    //     return pub.return_success(pub.lang('文档名称修改成功'));
    // }
    /**
     * 重新生成文档索引
     * @param args
     * @param args.ragName <string> 知识库名称
     * @param args.docName <string> 文档名称
     * @returns
     */
    async reindex_document(args) {
        let result = await new rag_1.Rag().reindexDocument(args.ragName, args.docId);
        if (!result) {
            return public_1.pub.return_error(public_1.pub.lang('操作失败'));
        }
        return public_1.pub.return_success(public_1.pub.lang('操作成功'));
    }
    /**
     * 重新生成知识库索引
     * @param args
     * @param args.ragName <string> 知识库名称
     * @returns
     */
    async reindex_rag(args) {
        let result = await new rag_1.Rag().reindexRag(args.ragName);
        if (!result) {
            return public_1.pub.return_error(public_1.pub.lang('操作失败'));
        }
        return public_1.pub.return_success(public_1.pub.lang('操作成功'));
    }
    /**
     * 检索知识库
     * @param args
     * @param args.ragName <string> 知识库名称
     * @param args.queryText <string> 查询文本
     * @returns
     */
    async search_document(args) {
        let result = await new rag_1.Rag().searchDocument(JSON.parse(args.ragList), args.queryText);
        return public_1.pub.return_success(public_1.pub.lang('操作成功'), result);
    }
    /**
     * 获取图片
     * @param args
     * @param args.r <string> 知识库名称
     * @param args.n <string> 图片名称
     * @returns
     */
    async images(args, event) {
        // 检查参数
        if (!args.r) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (!args.n) {
            return public_1.pub.return_error(public_1.pub.lang('图片名称不能为空'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + args.r;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        // 检查图片是否存在
        let imgFile = ragPath + "/images/" + args.n;
        if (!public_1.pub.file_exists(imgFile)) {
            let imgFile1 = imgFile + ".png";
            if (!public_1.pub.file_exists(imgFile1)) {
                imgFile1 = imgFile + ".jpg";
                if (!public_1.pub.file_exists(imgFile1)) {
                    return public_1.pub.return_error(public_1.pub.lang('图片不存在'));
                }
            }
        }
        // 设置响应头
        event.response.set('Content-Type', 'image/png');
        // 返回文件流
        const stream = fs.createReadStream(imgFile);
        return stream;
    }
    /**
     * 测试分块
     * @param args
     * @param args.filename <string> 文件名
     * @param args.chunkSize <number> 块大小
     * @param args.overlapSize <number> 重叠大小
     * @param args.separators <string[]> 分隔符
     * @returns
     */
    async test_chunk(args) {
        let { filename, chunkSize, overlapSize, separators } = args;
        let ragObj = new rag_1.Rag();
        let result = await ragObj.parseDocument(filename, '');
        let ragTask = new rag_task_1.RagTask();
        if (typeof separators == 'string') {
            separators = [separators];
        }
        let chunkList = ragTask.splitText(filename, result.content, separators, chunkSize, overlapSize);
        result.chunkList = chunkList;
        return public_1.pub.return_success(public_1.pub.lang('操作成功'), result);
    }
    // 优化表
    async optimize_table(args) {
        await vector_lancedb_1.LanceDBManager.optimizeTable('doc_table');
        let res = await vector_lancedb_1.LanceDBManager.optimizeTable(public_1.pub.md5(args.ragName));
        return public_1.pub.return_success(res);
    }
    /**
     * 获取文档分块列表
     * @param args
     * @param args.ragName <string> 知识库名称
     * @param args.docId <string> 文档ID
     * @returns
     **/
    async get_doc_chunk_list(args) {
        // 检查参数
        if (!args.ragName) {
            return public_1.pub.return_error(public_1.pub.lang('知识库名称不能为空'));
        }
        if (!args.docId) {
            return public_1.pub.return_error(public_1.pub.lang('文档ID不能为空'));
        }
        // 知识库保存路径
        const ragPath = public_1.pub.get_rag_path() + "/" + args.ragName;
        // 检查知识库是否存在
        if (!public_1.pub.file_exists(ragPath)) {
            return public_1.pub.return_error(public_1.pub.lang('知识库不存在'));
        }
        let ragObj = new rag_1.Rag();
        let result = await ragObj.getDocChunkList(args.ragName, args.docId);
        return public_1.pub.return_success(public_1.pub.lang('操作成功'), result);
    }
}
/**
 * 重写 RagController 类的 toString 方法，方便调试和日志输出
 * @returns {string} - 类的字符串表示
 */
RagController.toString = () => '[class RagController]';
exports.default = RagController;
//# sourceMappingURL=rag.js.map