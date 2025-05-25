import { SearchResult } from "./utils";
export declare const searchEngines: {
    baidu: (query: string) => Promise<SearchResult[]>;
    duckduckgo: (query: string) => Promise<SearchResult[]>;
    sogou: (query: string) => Promise<SearchResult[]>;
    sougou: (query: string) => Promise<SearchResult[]>;
    google: (query: string) => Promise<SearchResult[]>;
    so360: (query: string) => Promise<SearchResult[]>;
    360: (query: string) => Promise<SearchResult[]>;
};
export declare const searchWeb: (provider: string, query: string) => Promise<SearchResult[]>;
export declare const getSearchQuery: (query: string, model: string, chatHistory: string) => Promise<string>;
export declare const getDefaultPrompt: (query: string, model: string, agent_name: string) => {
    userPrompt: string;
    systemPrompt: string;
    searchResultList: any;
    query: string;
};
export declare const getPromptForWeb: (query: string, model: string, chatHistory: string, doc_files: string[], agent_name: string, searchResultList?: any[], searchProvider?: string) => Promise<{
    userPrompt: string;
    systemPrompt: string;
    searchResultList: any;
    query: string;
}>;
export declare const search: (query: string, searchProvider: string) => Promise<SearchResult[]>;
