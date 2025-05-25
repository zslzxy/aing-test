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
exports.Rag = exports.getDefaultPrompt = void 0;
const doc_1 = require("./doc_engins/doc");
const vector_lancedb_1 = require("./vector_database/vector_lancedb");
const path = __importStar(require("path"));
const public_1 = require("../class/public");
const agent_1 = require("../service/agent");
// 获取模板常量
const getTemplate = (agent_name) => {
    agent_name = agent_name || '';
    let agentInfo = agent_1.agentService.get_agent_config(agent_name);
    // 提取模板常量
    let TEMPLATES_LANG = [
        agentInfo ? agentInfo.prompt : public_1.pub.lang('以下内容是基于用户发送的消息的知识库检索结果'),
        public_1.pub.lang('在我给你的检索结果中，每个结果都是[检索结果 X begin]...[检索结果 X end]格式的，X代表每段知识内容的的数字索引。另外检索结果中可能包含一些不相关的信息，你可以根据需要选择其中的内容。'),
        public_1.pub.lang('在回答时，请注意以下几点'),
        public_1.pub.lang('今天是'),
        public_1.pub.lang('用户所在地点是'),
        public_1.pub.lang('不要在回答内容中提及检索结果的具体来源，也不要提及检索结果的具体排名。'),
        public_1.pub.lang('并非检索结果的所有内容都与用户的问题密切相关，你需要结合问题，对检索结果进行甄别、筛选。'),
        agentInfo ? '' : public_1.pub.lang('对于列举类的问题（如列举所有航班信息），尽量将答案控制在10个要点以内，并告诉用户可以查看检索来源、获得完整信息。优先提供信息完整、最相关的列举项；如非必要，不要主动告诉用户检索结果未提供的内容。'),
        agentInfo ? '' : public_1.pub.lang('对于创作类的问题（如写论文），你需要解读并概括用户的题目要求，选择合适的格式，充分利用检索结果并抽取重要信息，生成符合用户要求、极具思想深度、富有创造力与专业性的答案。你的创作篇幅需要尽可能延长，对于每一个要点的论述要推测用户的意图，给出尽可能多角度的回答要点，且务必信息量大、论述详尽。'),
        agentInfo ? '' : public_1.pub.lang('如果回答很长，请尽量结构化、分段落总结。如果需要分点作答，尽量控制在5个点以内，并合并相关的内容。'),
        agentInfo ? '' : public_1.pub.lang('对于客观类的问答，如果问题的答案非常简短，可以适当补充一到两句相关信息，以丰富内容。'),
        public_1.pub.lang('你需要根据用户要求和回答内容选择合适、美观的回答格式，确保可读性强。'),
        public_1.pub.lang('你的回答应该综合多个相关知识片段来回答，不能重复引用一个知识片段。'),
        public_1.pub.lang('除非用户要求，否则你回答的语言需要和用户提问的语言保持一致。'),
        public_1.pub.lang('用户消息为'),
    ];
    let OTHER_SYSTEM_PROMPT_TPL_LANG = [
        agentInfo ? agentInfo.prompt : public_1.pub.lang('你是一个擅长根据知识库检索结果回答用户查询的人工智能模型。'),
        public_1.pub.lang('在回答时，请注意以下几点'),
        public_1.pub.lang('根据提供的检索结果生成信息丰富且与用户查询相关的回答，如果知识库检索结果中有图片引用信息，可根据需要引用这些图片来强化内容结构。'),
        public_1.pub.lang('当前日期和时间为'),
        public_1.pub.lang('用户所在地区为'),
        public_1.pub.lang('不要提及检索结果的具体排名。'),
        public_1.pub.lang('并非检索结果的所有内容都与用户的问题密切相关，你需要结合用户的意图，对检索结果进行甄别、筛选。'),
        agentInfo ? '' : public_1.pub.lang('对于列举类的问题（如列举所有航班信息），尽量将答案控制在10个要点以内，并告诉用户可以查看检索来源、获得完整信息。优先提供信息完整、最相关的列举项'),
        agentInfo ? '' : public_1.pub.lang('对于创作类的问题（如写论文），你需要解读并概括用户的题目要求，选择合适的格式，充分利用检索结果并抽取重要信息，生成符合用户要求、极具思想深度、富有创造力与专业性的答案。你的创作篇幅需要尽可能延长，对于每一个要点的论述要推测用户的意图，给出尽可能多角度的回答要点，且务必信息量大、论述详尽。'),
        agentInfo ? '' : public_1.pub.lang('如果回答很长，请尽量结构化、分段落总结。如果需要分点作答。'),
        agentInfo ? '' : public_1.pub.lang('对于客观类的问答，如果问题的答案非常简短，可以适当补充一到两句相关信息，以丰富内容。'),
        agentInfo ? '' : public_1.pub.lang('你需要根据用户要求和回答内容选择合适、美观的回答格式，确保可读性强。'),
        public_1.pub.lang('你的回答应该综合多个相关知识片段来回答，不能重复引用一个知识片段。'),
        public_1.pub.lang(''),
        public_1.pub.lang('以下内容是基于用户发送的消息的检索结果'),
    ];
    let QUERY_PROMPT_TPL_LANG = [
        public_1.pub.lang('根据用户的问题，和上一个对话的内容，理解用户意图，生成一个用于检索引擎检索的问题，这个问题的检索结果将会用于帮助智能模型回答用户问题，回答内容中只有一个问题，且只包含问题内容，不包含其它信息。'),
        public_1.pub.lang('今天的时间是'),
        public_1.pub.lang('用户所在地点是'),
        public_1.pub.lang('上一个对话'),
        public_1.pub.lang('后续问题'),
        public_1.pub.lang('用于检索的问题'),
    ];
    let DEEPSEEK_PROMPT_TPL = `# ${TEMPLATES_LANG[0]}:
{search_results}
${TEMPLATES_LANG[1]}
${TEMPLATES_LANG[2]}:
- ${TEMPLATES_LANG[3]}{current_date_time}。
- ${TEMPLATES_LANG[4]}{user_location}。
- ${TEMPLATES_LANG[5]}
- ${TEMPLATES_LANG[6]}
- ${TEMPLATES_LANG[7]}
- ${TEMPLATES_LANG[8]}
- ${TEMPLATES_LANG[9]}
- ${TEMPLATES_LANG[10]}
- ${TEMPLATES_LANG[11]}
- ${TEMPLATES_LANG[12]}
- ${TEMPLATES_LANG[13]}

{doc_files}

# ${TEMPLATES_LANG[14]}:
{question}`;
    let DEEPSEEK_SYSTEM_PROMPT_TPL = "";
    let OTHER_PROMPT_TPL = "{question}";
    let OTHER_SYSTEM_PROMPT_TPL = `# ${OTHER_SYSTEM_PROMPT_TPL_LANG[0]}:
## ${OTHER_SYSTEM_PROMPT_TPL_LANG[1]}:
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[2]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[3]} {current_date_time}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[4]} {user_location}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[5]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[6]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[7]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[8]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[9]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[10]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[11]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[12]}
- ${OTHER_SYSTEM_PROMPT_TPL_LANG[13]}

## ${OTHER_SYSTEM_PROMPT_TPL_LANG[14]}:
<search-results>
{search_results}
</search-results>
{doc_files}`;
    let QUERY_PROMPT_TPL = `# ${QUERY_PROMPT_TPL_LANG[0]}
## ${QUERY_PROMPT_TPL_LANG[1]}: {current_date_time}
## ${QUERY_PROMPT_TPL_LANG[2]}: {user_location}
## ${QUERY_PROMPT_TPL_LANG[3]}:
{chat_history}

## ${QUERY_PROMPT_TPL_LANG[4]}: {question}
${QUERY_PROMPT_TPL_LANG[5]}:`;
    return { DEEPSEEK_PROMPT_TPL, DEEPSEEK_SYSTEM_PROMPT_TPL, OTHER_PROMPT_TPL, OTHER_SYSTEM_PROMPT_TPL, QUERY_PROMPT_TPL };
};
// 获取当前日期时间字符串
const getCurrentDateTime = () => {
    // 获取当前日期时间
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    // 星期几
    const weekDay = [
        public_1.pub.lang('星期日'),
        public_1.pub.lang('星期一'),
        public_1.pub.lang('星期二'),
        public_1.pub.lang('星期三'),
        public_1.pub.lang('星期四'),
        public_1.pub.lang('星期五'),
        public_1.pub.lang('星期六')
    ][now.getDay()];
    // 上午/下午
    const ampm = hour < 12 ? public_1.pub.lang('上午') : public_1.pub.lang('下午');
    return `${year}-${month}-${day} ${hour}:${minute}:${second} -- ${ampm}  ${weekDay}`;
};
// 获取用户所在地区
const getUserLocation = () => {
    if (public_1.pub.get_language() == 'zh') {
        return global.area || public_1.pub.lang("未知地区");
    }
    return public_1.pub.lang("未知地区");
};
// 生成 DeepSeek 类型的提示信息
const generateDeepSeekPrompt = (searchResultList, query, doc_files, agent_name) => {
    const currentDateTime = getCurrentDateTime();
    const userLocation = getUserLocation();
    const search_results = searchResultList.map((result, idx) => `[${public_1.pub.lang('检索结果')} ${idx + 1} begin]
${public_1.pub.lang('来源')}: ${result.link}
${public_1.pub.lang('内容')}:${result.content}
[${public_1.pub.lang('检索结果')} ${idx} end]`).join("\n");
    let doc_files_str = doc_files.map((doc_file, idx) => `[${public_1.pub.lang('用户文档')} ${idx + 1} begin]
${public_1.pub.lang('内容')}: ${doc_file}
[${public_1.pub.lang('用户文档')} ${idx} end]`).join("\n");
    doc_files_str = `${public_1.pub.lang('以下是用户上传的文档内容，每个文档内容都是[用户文档 X begin]...[用户文档 X end]格式的，你可以根据需要选择其中的内容。')}
${doc_files_str}`;
    const { DEEPSEEK_PROMPT_TPL, DEEPSEEK_SYSTEM_PROMPT_TPL } = getTemplate(agent_name);
    const userPrompt = DEEPSEEK_PROMPT_TPL
        .replace("{search_results}", search_results)
        .replace("{current_date_time}", currentDateTime)
        .replace("{question}", query)
        .replace("{user_location}", userLocation)
        .replace("{doc_files}", doc_files_str);
    const systemPrompt = DEEPSEEK_SYSTEM_PROMPT_TPL;
    return { userPrompt, systemPrompt, searchResultList, query };
};
// 生成其他类型的提示信息
const generateOtherPrompt = (searchResultList, query, doc_files, agent_name) => {
    const currentDateTime = getCurrentDateTime();
    const userLocation = getUserLocation();
    const search_results = searchResultList.map((result, idx) => `<result source="${result.link}" id="${idx + 1}">${result.content}</result>`).join("\n");
    let doc_files_str = doc_files.map((doc_file, idx) => `<doc source="${doc_file}" id="${idx + 1}">${doc_file}</doc>`).join("\n");
    doc_files_str = `${public_1.pub.lang('以下是用户上传的文档内容')}
<doc_files>
${doc_files_str}
</doc_files>`;
    const { OTHER_PROMPT_TPL, OTHER_SYSTEM_PROMPT_TPL } = getTemplate(agent_name);
    const systemPrompt = OTHER_SYSTEM_PROMPT_TPL
        .replace("{search_results}", search_results)
        .replace("{current_date_time}", currentDateTime)
        .replace("{user_location}", userLocation)
        .replace("{doc_files}", doc_files_str);
    const userPrompt = OTHER_PROMPT_TPL.replace("{question}", query);
    return { userPrompt, systemPrompt, searchResultList, query };
};
// 获取默认提示信息
const getDefaultPrompt = (query, model) => {
    let userPrompt = '';
    let systemPrompt = '';
    let searchResultList = [];
    const currentDateTime = getCurrentDateTime();
    const userLocation = getUserLocation();
    const { DEEPSEEK_SYSTEM_PROMPT_TPL, OTHER_SYSTEM_PROMPT_TPL } = getTemplate();
    if (model.indexOf("deepseek") !== -1) {
        userPrompt = DEEPSEEK_SYSTEM_PROMPT_TPL
            .replace("{current_date_time}", currentDateTime)
            .replace("{user_location}", userLocation)
            .replace("{question}", query)
            .replace("{search_results}", '');
    }
    else {
        systemPrompt = OTHER_SYSTEM_PROMPT_TPL
            .replace("{current_date_time}", currentDateTime)
            .replace("{user_location}", userLocation)
            .replace("{question}", query)
            .replace("{search_results}", '');
    }
    return { userPrompt, systemPrompt, searchResultList, query };
};
exports.getDefaultPrompt = getDefaultPrompt;
class Rag {
    docTable = 'doc_table';
    /**
     * 解析文档
     * @param filename:string 文件名
     * @param ragName:string rag名称
     * @returns Promise<any>
     */
    async parseDocument(filename, ragName, saveToFile) {
        return await (0, doc_1.parseDocument)(filename, ragName, saveToFile);
    }
    /**
     * 检查文档表是否存在
     * @returns Promise<boolean>
     */
    async checkDocTable(tableName) {
        let tablePath = path.join(public_1.pub.get_data_path(), 'rag', 'vector_db', tableName + '.lance');
        return public_1.pub.file_exists(tablePath);
    }
    async checkDocTableSchema(tableName) {
        let db = await vector_lancedb_1.LanceDBManager.connect();
        let tableObj = await db.openTable(tableName);
        let schema = await tableObj.schema();
        let fields = schema.fields;
        let newFields = { 'doc_id': "0", 'doc_name': "", 'doc_file': "", 'md_file': "", 'doc_rag': "", 'doc_abstract': "", 'doc_keywords': ['key1', 'key2'], 'is_parsed': -1, 'update_time': 0, 'separators': ['\n\n', '。'], 'chunk_size': 500, 'overlap_size': 50 };
        let newFieldsKeys = Object.keys(newFields);
        let isSame = true;
        let oldFieldsKeys = [];
        for (let field of fields) {
            oldFieldsKeys.push(field.name);
        }
        // 检查字段是否一致
        for (let field of newFieldsKeys) {
            if (oldFieldsKeys.indexOf(field) == -1) {
                console.log(`字段 ${field} 不一致`);
                isSame = false;
                break;
            }
        }
        if (isSame) {
            tableObj.close();
            db.close();
            return true;
        }
        // 导出旧表数据
        let oldDocList = await tableObj.query().limit(100000).toArray();
        // 删除旧表
        await vector_lancedb_1.LanceDBManager.dropTable(tableName);
        // 为旧表添加新字段和默认值
        let newDocList = [];
        for (let item of oldDocList) {
            let newItem = {};
            for (let field of newFieldsKeys) {
                newItem[field] = item[field] || newFields[field];
            }
            newItem['doc_keywords'] = await this.generateKeywords(item['doc_abstract']);
            newDocList.push(newItem);
        }
        // 创建新表并插入数据
        await vector_lancedb_1.LanceDBManager.createTableAt(tableName, newDocList, [
            { key: 'doc_id', type: 'btree' },
            { key: 'doc_rag', type: 'btree' },
            { key: 'is_parsed', type: 'btree' },
            { key: 'doc_keywords', type: 'labelList' },
        ]);
        tableObj.close();
        db.close();
        return true;
    }
    /**
     * 创建文档表
     * @returns Promise<any>
     */
    async createDocTable(tableName) {
        if (await this.checkDocTable(tableName)) {
            return true;
        }
        let ok = await vector_lancedb_1.LanceDBManager.createTableAt(tableName, [{
                doc_id: '0',
                doc_name: '',
                doc_file: '',
                md_file: '',
                doc_rag: '',
                doc_abstract: '',
                doc_keywords: ['key1', 'key2'],
                is_parsed: -1,
                update_time: 0,
                separators: ['\n\n', '。'],
                chunk_size: 500,
                overlap_size: 50,
            }], [
            { key: 'doc_id', type: 'btree' },
            { key: 'doc_rag', type: 'btree' },
            { key: 'is_parsed', type: 'btree' },
            { key: 'doc_keywords', type: 'labelList' },
        ]);
        await vector_lancedb_1.LanceDBManager.deleteRecord(tableName, "doc_id='0'");
        return ok;
    }
    /**
     * 生成文档关键词
     * @param doc:string 文档内容
     * @param num:number 关键词数量，默认为5
     * @returns Promise<string[]> 提取的关键词数组
     */
    async generateKeywords(doc, num = 5) {
        let result = public_1.tfidf.extractKeywords(public_1.jieba, doc, num);
        let keywords = result.map((item) => item.keyword);
        return keywords;
    }
    /**
     * 生成文档摘要
     * @param doc:string 文档内容
     * @returns Promise<string>
     * @example
     * let abstract = await rag.generateAbstract(doc);
     */
    async generateAbstract(doc) {
        // 从文档中提取前100个字符作为摘要
        if (doc && doc.trim() !== '') {
            return doc.substring(0, 100) + '...';
        }
        return '';
    }
    async getDocNameByDocId(docId) {
        let docContentList = await vector_lancedb_1.LanceDBManager.queryRecord(this.docTable, `doc_id='${docId}'`);
        if (docContentList.length > 0) {
            return docContentList[0].doc_name;
        }
        return '';
    }
    /**
     * 删除指定文档
     * @param ragName <string> rag名称
     * @param docId <string> 文档ID
     * @returns Promise<any>
     */
    async removeRagDocument(ragName, docId) {
        await vector_lancedb_1.LanceDBManager.deleteRecord(this.docTable, `doc_id='${docId}'`);
        return await vector_lancedb_1.LanceDBManager.deleteDocument(public_1.pub.md5(ragName), docId);
    }
    /**
     * 删除指定知识库
     * @param ragName <string> rag名称
     * @returns Promise<any>
     */
    async removeRag(ragName) {
        // 删除知识库所有文档
        await vector_lancedb_1.LanceDBManager.deleteRecord(this.docTable, `doc_rag='${ragName}'`);
        // 删除知识向量表
        return await vector_lancedb_1.LanceDBManager.dropTable(public_1.pub.md5(ragName));
    }
    /**
     * 将文档添加到数据库
     * @param filename:string 文件名
     * @param ragName:string rag名称
     * @returns Promise<any>
     */
    async addDocumentToDB(filename, ragName, separators, chunkSize, overlapSize) {
        filename = path.resolve(filename);
        await this.createDocTable(this.docTable);
        await this.checkDocTableSchema(this.docTable);
        let dataDir = public_1.pub.get_data_path();
        let repDataDir = '{DATA_DIR}';
        let pdata = [{
                doc_id: public_1.pub.uuid(),
                doc_name: path.basename(filename),
                doc_file: filename.replace(dataDir, repDataDir),
                md_file: '',
                doc_rag: ragName,
                doc_abstract: '',
                doc_keywords: [],
                is_parsed: 0,
                update_time: public_1.pub.time(),
                separators: separators,
                chunk_size: chunkSize,
                overlap_size: overlapSize,
            }];
        return await vector_lancedb_1.LanceDBManager.addRecord(this.docTable, pdata);
    }
    /**
     * 从数据库中删除文档
     * @param docId:string 文档ID
     * @returns Promise<any>
     */
    async deleteDocumentFromDB(docId) {
        return await vector_lancedb_1.LanceDBManager.deleteRecord(this.docTable, "doc_id=" + docId);
    }
    /**
     * 获取知识库信息
     * @param  ragName:string 知识库名称
     * @returns Promise<any>
     */
    async getRagInfo(ragName) {
        let ragConfigFile = path.resolve(public_1.pub.get_data_path(), 'rag', ragName, 'config.json');
        if (public_1.pub.file_exists(ragConfigFile)) {
            let result = JSON.parse(public_1.pub.read_file(ragConfigFile));
            if (!result.supplierName)
                result.supplierName = 'ollama';
            return result;
        }
        return null;
    }
    /**
     * 检索文档
     * @param ragList:string[] rag列表
     * @param queryText:string 查询文本
     * @returns Promise<any>
     */
    async searchDocument(ragList, queryText) {
        // 生成关键词
        let keywords = public_1.pub.cutForSearch(queryText);
        // 并行执行所有知识库的检索请求
        const searchPromises = ragList.map(async (ragName) => {
            let ragInfo = await this.getRagInfo(ragName);
            if (!ragInfo) {
                return [];
            }
            return vector_lancedb_1.LanceDBManager.hybridSearchByNew(public_1.pub.md5(ragName), ragInfo, queryText, keywords);
        });
        // 等待所有检索完成并合并结果
        const results = await Promise.all(searchPromises);
        // 扁平化结果数组并返回
        return results.flat();
    }
    cutRagResult(searchResultList, supplierName, docLength) {
        // 计算内容长度，超过限制则截断，ollama最大限制4K，其它最大限制32K
        let maxLength = 4096 * 1.5;
        if (supplierName !== 'ollama') {
            maxLength = 32768 * 1.5;
        }
        if (docLength > maxLength) {
            let currentLength = 0;
            for (let i = 0; i < searchResultList.length; i++) {
                let docLength = searchResultList[i].content.length;
                // 截断超过最大长度的内容
                if (currentLength + docLength > maxLength) {
                    if (currentLength == maxLength) {
                        searchResultList[i].content = "";
                    }
                    else {
                        searchResultList[i].content = searchResultList[i].content.substring(0, maxLength - currentLength);
                        currentLength = maxLength;
                    }
                }
            }
        }
        // 删除空内容
        searchResultList = searchResultList.filter((item) => item.content.trim() !== '');
        return searchResultList;
    }
    /**
     * 检索并拼接提示词
     * @param ragList:string[] rag列表
     * @param model:string 模型名称
     * @param queryText:string 查询文本
     * @param doc_files:string[] 文档内容列表
     * @param agent_name <string> 智能体名称
     * @returns Promise<{ userPrompt: string; systemPrompt: string;searchResultList:any,query:string }>
     */
    async searchAndSuggest(supplierName, model, queryText, doc_files, agent_name, rag_results, ragList) {
        try {
            if (!rag_results || !rag_results.length) {
                if (ragList.length > 0) {
                    rag_results = await this.searchDocument(ragList, queryText);
                }
            }
            // 兼容搜索引擎的格式，link => doc_file,title=>doc_name,content=>doc
            let searchResultList = [];
            let docLength = 0;
            for (let docContent of rag_results) {
                if (!docContent.docFile || !docContent.docName) {
                    continue;
                }
                docLength += docContent.doc.length;
                searchResultList.push({
                    link: docContent.docFile,
                    title: docContent.docName,
                    content: docContent.doc
                });
            }
            // 截断多余内容
            searchResultList = this.cutRagResult(searchResultList, supplierName, docLength);
            if (model.indexOf("deepseek") !== -1) {
                return generateDeepSeekPrompt(searchResultList, queryText, doc_files, agent_name);
            }
            else {
                return generateOtherPrompt(searchResultList, queryText, doc_files, agent_name);
            }
        }
        catch (e) {
            return {
                userPrompt: queryText,
                systemPrompt: '',
                searchResultList: [],
                query: `${queryText}, error: ${e.message}`
            };
        }
    }
    /**
     * 重新生成文档索引
     * @param ragName:string 知识库名称
     * @param docId:string 文档ID
     * @returns Promise<any>
     */
    async reindexDocument(ragName, docId) {
        let docContentList = await vector_lancedb_1.LanceDBManager.queryRecord(this.docTable, "doc_id=" + docId);
        if (docContentList.length > 0) {
            await vector_lancedb_1.LanceDBManager.updateRecord(ragName, { where: `doc_id='${docId}'`, values: { is_parsed: 0 } });
        }
        return true;
    }
    /**
     * 重新生成知识库索引
     * @param ragName:string 知识库名称
     * @returns Promise<any>
     */
    async reindexRag(argName) {
        await vector_lancedb_1.LanceDBManager.updateRecord(argName, { where: `doc_aag='${argName}'`, values: { is_parsed: 0 } });
        return true;
    }
    /**
     * 获取文档分片列表
     * @param ragName:string 知识库名称
     * @param docId:string 文档ID
     * @returns Promise<any[]>
     */
    async getDocChunkList(ragName, docId) {
        let where = "`docId` = '" + docId + "'";
        let chunkList = await vector_lancedb_1.LanceDBManager.queryRecord(public_1.pub.md5(ragName), where, ["id", "docId", "doc", "tokens"]);
        return chunkList;
    }
}
exports.Rag = Rag;
//# sourceMappingURL=rag.js.map