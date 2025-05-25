"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const public_1 = require("../../../class/public");
const tesseract_js_1 = require("tesseract.js");
// 定义常量，方便修改配置
const LANG = 'eng+chi_sim';
const WORKER_THREADS = 3;
const CONFIDENCE_THRESHOLD = 40;
// 封装错误处理函数
const handleError = (error, message) => {
    console.log(`${message}:`, error);
    return '';
};
// 初始化 Tesseract worker
const initializeWorker = async () => {
    const worker = await (0, tesseract_js_1.createWorker)(LANG, WORKER_THREADS, {
        langPath: public_1.pub.get_resource_path() + "/traineddata",
    });
    await worker.reinitialize(LANG, WORKER_THREADS);
    await worker.setParameters({
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: tesseract_js_1.PSM.AUTO,
        tessedit_ocr_engine_mode: '2',
    });
    return worker;
};
// 对识别结果进行后处理
const postProcessText = (text) => {
    return text
        .replace(/\s{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};
// 过滤低置信度行
const filterLowConfidenceLines = (lines, threshold) => {
    return lines
        .filter(line => line.confidence > threshold)
        .map(line => line.text)
        .join('\n');
};
/**
 * 将图片中的文字解析并转换为Markdown格式
 * @param filename 图片文件路径
 * @returns Markdown格式的字符串
 */
async function parse(filename, ragName) {
    try {
        // 初始化 worker
        const worker = await initializeWorker();
        // 从图片中识别文本
        const { data } = await worker.recognize(filename);
        // 对识别结果进行后处理
        let cleanText = postProcessText(data.text);
        // 过滤低置信度行
        const lines = data.blocks || [];
        const filteredText = filterLowConfidenceLines(lines, CONFIDENCE_THRESHOLD);
        // 如果过滤后的文本有内容，则使用它
        if (filteredText.trim().length > 0) {
            cleanText = filteredText;
        }
        // 终止 worker
        await worker.terminate();
        return cleanText;
    }
    catch (error) {
        return handleError(error, 'image error');
    }
}
//# sourceMappingURL=image_parse.js.map