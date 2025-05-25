"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_URL_LAST = void 0;
exports.get_image_save_path = get_image_save_path;
exports.get_doc_save_path = get_doc_save_path;
// 常量
const public_1 = require("../../class/public");
exports.IMAGE_URL_LAST = '{URL}/rag';
function get_image_save_path() {
    return public_1.pub.get_data_path() + '/rag/';
}
function get_doc_save_path() {
    return public_1.pub.get_data_path() + '/rag/';
}
//# sourceMappingURL=utils.js.map