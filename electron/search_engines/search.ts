import { localBaiduSearch } from "./baidu";
import { SearchResult } from "./utils";
import { localDuckDuckGoSearch } from "./duckduckgo";
import { localSogouSearch } from "./sogou";
import { local360Search } from "./so360";
import ollama from "ollama";

// 提取模板常量
const TEMPLATES = {
    DEEPSEEK_PROMPT_TPL: `# 以下内容是基于用户发送的消息的搜索结果:
{search_results}
在我给你的搜索结果中，每个结果都是[搜索结果 X begin]...[搜索结果 X end]格式的，X代表每篇文章的数字索引。另外搜索结果中可能包含一些不相关的信息，你可以根据需要选择其中的内容。
在回答时，请注意以下几点：
- 今天是{current_date_time}。
- 用户所在地区是{user_location}。
- 不要在回答内容中提及搜索结果的具体来源，也不要提及搜索结果的具体排名。
- 并非搜索结果的所有内容都与用户的问题密切相关，你需要结合问题，对搜索结果进行甄别、筛选。
- 对于列举类的问题（如列举所有航班信息），尽量将答案控制在10个要点以内，并告诉用户可以查看搜索来源、获得完整信息。优先提供信息完整、最相关的列举项；如非必要，不要主动告诉用户搜索结果未提供的内容。
- 对于创作类的问题（如写论文），你需要解读并概括用户的题目要求，选择合适的格式，充分利用搜索结果并抽取重要信息，生成符合用户要求、极具思想深度、富有创造力与专业性的答案。你的创作篇幅需要尽可能延长，对于每一个要点的论述要推测用户的意图，给出尽可能多角度的回答要点，且务必信息量大、论述详尽。
- 如果回答很长，请尽量结构化、分段落总结。如果需要分点作答，尽量控制在5个点以内，并合并相关的内容。
- 对于客观类的问答，如果问题的答案非常简短，可以适当补充一到两句相关信息，以丰富内容。
- 你需要根据用户要求和回答内容选择合适、美观的回答格式，确保可读性强。
- 你的回答应该综合多个相关网页来回答，不能重复引用一个网页。
- 除非用户要求，否则你回答的语言需要和用户提问的语言保持一致。

# 用户消息为：
{question}`,
    DEEPSEEK_SYSTEM_PROMPT_TPL: "",
    OTHER_PROMPT_TPL: "{question}",
    OTHER_SYSTEM_PROMPT_TPL: `你是一个擅长搜索网络和回答用户查询的人工智能模型。

根据提供的搜索结果生成信息丰富且与用户查询相关的响应。当前日期和时间为 {current_date_time} ,用户所在地区为 {user_location}。

<search-results>
 {search_results}
</search-results>`,
    QUERY_PROMPT_TPL: `# 根据用户的问题，和上一个对话的内容，理解用户意图，生成一个用于搜索引擎搜索的问题，这个问题的搜索结果将会用于帮助智能模型回答用户问题，回答内容中只有一个问题，且只包含问题内容，不包含其它信息。

## 今天的时间是：{current_date_time}
## 用户所在地点：{user_location}
## 上一个对话:
{chat_history}

## 后续问题： {question}
用于搜索的问题：`
};

// 搜索引擎映射
export const searchEngines = {
    baidu: localBaiduSearch,
    duckduckgo: localDuckDuckGoSearch,
    sogou: localSogouSearch,
    sougou: localSogouSearch,
    google: local360Search,
    so360: local360Search,
    360: local360Search,
};

// 搜索网页函数
export const searchWeb = async (provider: string, query: string): Promise<SearchResult[]> => {
    if (!searchEngines[provider]) {
        throw new Error(`Search provider ${provider} not found`);
    }
    return searchEngines[provider](query);
};

// 获取当前日期时间字符串
const getCurrentDateTime = () => new Date().toLocaleString();

// 获取用户所在地区
const getUserLocation = () => global.area || "未知地区";

// 获取用于搜索的问题
export const getSearchQuery = async (query: string, model: string, chatHistory: string): Promise<string> => {
    try {
        if (chatHistory.length === 0 && query.length < 30) {
            return query;
        }

        if(query.length < 20){
            return query;
        }

        // query最后一个字符是问号，直接返回
        if (query[query.length - 1] === '？' || query[query.length - 1] === '?') {
            return query;
        }

        const currentDateTime = getCurrentDateTime();
        const userLocation = getUserLocation();

        const queryPrompt = TEMPLATES.QUERY_PROMPT_TPL
           .replace("{question}", query)
           .replace("{chat_history}", chatHistory)
           .replace("{current_date_time}", currentDateTime)
           .replace("{user_location}", userLocation);

        const res = await ollama.generate({
            prompt: queryPrompt,
            model: model
        });

        let result = res.response;
        if(!result) return query;
        if (result.indexOf('</think>') !== -1) {
            result = result.split('</think>')[1].trim();
        }

        let lines = result.trim().split('\n');
        result = lines[lines.length - 1].trim();
        return result;
    } catch (error) {
        console.error('Error getting search query:', error);
        return query
    }
};

// 生成 DeepSeek 类型的提示信息
const generateDeepSeekPrompt = (searchResultList: SearchResult[], query: string): { userPrompt: string; systemPrompt: string,searchResultList:any,query:string } => {
    const currentDateTime = getCurrentDateTime();
    const userLocation = getUserLocation();

    const search_results = searchResultList.map(
        (result, idx) =>
            `[搜索结果 ${idx+1} begin]
连接: ${result.link}
标题: ${result.title}
内容:${result.content}
[搜索结果 ${idx} end]`
    ).join("\n");

    const userPrompt = TEMPLATES.DEEPSEEK_PROMPT_TPL
       .replace("{search_results}", search_results)
       .replace("{current_date_time}", currentDateTime)
       .replace("{question}", query)
       .replace("{user_location}", userLocation);

    const systemPrompt = TEMPLATES.DEEPSEEK_SYSTEM_PROMPT_TPL;

    return { userPrompt, systemPrompt, searchResultList,query };
};

// 生成其他类型的提示信息
const generateOtherPrompt = (searchResultList: SearchResult[], query: string): { userPrompt: string; systemPrompt: string,searchResultList:any,query:string } => {
    const currentDateTime = getCurrentDateTime();
    const userLocation = getUserLocation();

    const search_results = searchResultList.map(
        (result, idx) =>
            `<result source="${result.link}" id="${idx+1}">${result.content}</result>`
    ).join("\n");

    const systemPrompt = TEMPLATES.OTHER_SYSTEM_PROMPT_TPL
       .replace("{search_results}", search_results)
       .replace("{current_date_time}", currentDateTime)
       .replace("{user_location}", userLocation);

    const userPrompt = TEMPLATES.OTHER_PROMPT_TPL.replace("{question}", query);

    return { userPrompt, systemPrompt ,searchResultList,query};
};


// 获取默认提示信息
export const getDefaultPrompt = (query: string,model:string): { userPrompt: string; systemPrompt: string,searchResultList:any,query:string } => {
    let userPrompt = '';
    let systemPrompt = '';
    let searchResultList = [];
    const currentDateTime = getCurrentDateTime();
    const userLocation = getUserLocation();
    if (model.indexOf("deepseek") !== -1) {
        userPrompt = TEMPLATES.DEEPSEEK_SYSTEM_PROMPT_TPL
        .replace("{current_date_time}", currentDateTime)
        .replace("{user_location}", userLocation)
        .replace("{question}", query)
        .replace("{search_results}", '');
    }else{
        systemPrompt = TEMPLATES.OTHER_SYSTEM_PROMPT_TPL
        .replace("{current_date_time}", currentDateTime)
        .replace("{user_location}", userLocation)
        .replace("{question}", query)
        .replace("{search_results}", '');
    }

    return { userPrompt, systemPrompt,searchResultList,query };
}

// 获取网页搜索提示信息
export const getPromptForWeb = async (query: string, model: string, chatHistory: string, searchProvider: string): Promise<{ userPrompt: string; systemPrompt: string;searchResultList:any,query:string }> => {
    try {
        if(query.length < 4) return getDefaultPrompt(query,model);
        const searchQuery = await getSearchQuery(query, model, chatHistory);
        const searchResultList = await searchWeb(searchProvider, searchQuery);

        if (model.indexOf("deepseek") !== -1) {
            return generateDeepSeekPrompt(searchResultList, searchQuery);
        } else {
            return generateOtherPrompt(searchResultList, searchQuery);
        }
    } catch (error) {
        console.error('Error getting prompt for web:', error);
        throw new Error('Failed to get prompt for web');
    }
};