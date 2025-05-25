export declare const FETCH_HEADERS: {
    "User-Agent": string;
    Accept: string;
    "Accept-Language": string;
    "Accept-Encoding": string;
    DNT: string;
    Connection: string;
    "Upgrade-Insecure-Requests": string;
    "Sec-Fetch-Dest": string;
    "Sec-Fetch-Mode": string;
    "Sec-Fetch-Site": string;
    "Sec-Fetch-User": string;
};
export type SearchResult = {
    title: string | any;
    link: string | any;
    content: string | any;
};
export declare const withTimeout: (promise: Promise<any>, timeout: number) => Promise<any>;
export declare const getUrlsContent: (searchResult: SearchResult[]) => Promise<SearchResult[]>;
