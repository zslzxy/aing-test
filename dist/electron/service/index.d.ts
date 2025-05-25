declare class IndexService {
    private listFiles;
    /**
     * 复制数据到新路径
     * @returns
     */
    copyDataPath(): Promise<any>;
}
declare const indexService: IndexService;
export { IndexService, indexService, };
