"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMenu = void 0;
const { Menu, clipboard, shell } = require('electron');
const public_1 = require("./public");
// 右键菜单配置
class ContextMenu {
    event;
    params;
    constructor(event, params) {
        this.event = event;
        this.params = params;
    }
    /**
     * @name 创建右键菜单
     */
    get_context_menu() {
        let that = this;
        let template = [];
        if (that.params.selectionText) {
            // 是否有选中内容
            if (that.params.selectionText) {
                template.push({
                    id: 1,
                    label: public_1.pub.lang("复制"),
                    role: "copy",
                });
                template.push({
                    id: 2,
                    label: public_1.pub.lang("剪切"),
                    role: "cut",
                });
            }
        }
        let is_link = false;
        let clipboard_text = clipboard.readText();
        if (clipboard_text) {
            template.push({
                id: 3,
                label: public_1.pub.lang("粘贴"),
                role: "paste",
            });
        }
        template.push({
            id: 4,
            label: public_1.pub.lang("全选"),
            role: "selectAll",
        });
        if (that.params.selectionText) {
            // 粘贴选中的内容
            // template.push({
            //     id:5,
            //     label:pub.lang("粘贴选中内容"),
            //     accelerator: "",
            //     click: function () {
            //         // 粘贴选中的内容
            //         that.event.sender.copy();
            //         that.event.sender.paste();
            //     }
            // });
            // 选中内容是否为链接
            is_link = that.params.selectionText.match(/(http|https):\/\/([\w.]+\/?)\S*/);
            if (is_link) {
                template.push({
                    id: 6,
                    label: public_1.pub.lang("打开链接"),
                    accelerator: "",
                    click: function () {
                        shell.openExternal(that.params.selectionText);
                    }
                });
            }
        }
        return Menu.buildFromTemplate(template);
    }
}
exports.ContextMenu = ContextMenu;
//# sourceMappingURL=menu.js.map