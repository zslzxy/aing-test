/**
 * rag controller 类，负责管理知识库的相关操作
 * @class
 */
declare class SearchController {
    search(args: {
        query: string;
        searchProvider: string;
    }): Promise<import("../class/public").ReturnMsg>;
}
export default SearchController;
