declare class ContextMenu {
    event: any;
    params: any;
    constructor(event: any, params: any);
    /**
     * @name 创建右键菜单
     */
    get_context_menu(): any;
}
export { ContextMenu };
