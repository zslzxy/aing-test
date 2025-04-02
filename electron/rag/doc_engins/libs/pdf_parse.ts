import  fs from 'fs';
// import * as pdfjsLib from 'pdfjs-dist';


// 封装错误处理和日志记录
const logError = (message: string, error: any) => {
  console.error(`${message}:`, error);
};


/**
 * PDF解析器类
 */
export class PdfParser {
  private filename: string;
  private pdfDocument: any;

  /**
   * 构造函数
   * @param filename PDF文件路径
   */
  constructor(filename: string, ragName: string) {
    this.filename = filename;
  }

  /**
   * 初始化PDF.js和加载文档
   * @returns 是否成功初始化
   */
  private async initPdfDocument(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.filename)) {
        logError(`文件不存在`, this.filename);
        return false;
      }
      const pdfjsLib = await import('pdfjs-dist');
      const data = new Uint8Array(fs.readFileSync(this.filename));
      const loadingTask = pdfjsLib.getDocument({ data });
      this.pdfDocument = await loadingTask.promise;

      return true;
    } catch (error) {
      logError('初始化PDF文档失败', error);
      return false;
    }
  }


  /**
   * 解析PDF文件
   * @returns Markdown格式的内容
   */
  public async parse(): Promise<string> {
    if (!(await this.initPdfDocument()) || !this.pdfDocument) {
      return '';
    }
    let text = "";

    for(let i = 1; i <= this.pdfDocument.numPages; i++){
        const page = await this.pdfDocument.getPage(i);
        const textContent = await page.getTextContent({includeMarkedContent:true});
        let items:any = textContent.items;
        let isEndMarkedContent = false;
        let endMarkedContent = 0;
        let isStart = true;
        for(let item of items){
            // 标记内容结束
            if(item.type == 'endMarkedContent'){
                endMarkedContent++;
            }

            // 拼接文本
            if(item.fontName){
                text += item.str;
                endMarkedContent = 0;
            }
            
            // 根据标记增加换行符，并重置标记
            if(endMarkedContent == 2){
                text += "\n";
                endMarkedContent = 0;
                isEndMarkedContent = true;
            }

            // 开始和EOL标记视结束标记情况增加换行符
            if((item.hasEOL && isStart) || (!isEndMarkedContent && item.hasEOL)){
                text += "\n";
                isStart = false;
            }
        }

        // 每页结束增加换行符
        text += "\n";

    }
    // 去掉不可见字符
    text = text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g,"");
    text = text.replace(/[]/g,"");
    return text.trim();
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
  }
}

/**
 * 将 PDF 文件解析并转换为 Markdown 格式
 * @param filename PDF 文件路径
 * @returns Markdown 格式的字符串
 */
export async function parse(filename: string, ragName: string): Promise<string> {
  try {
    const parser = new PdfParser(filename, ragName);
    const markdown = await parser.parse();
    return markdown;
  } catch (error) {
    logError('解析 PDF 文件失败', error);
    return '';
  }
}