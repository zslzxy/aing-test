import * as pdfjsLib from 'pdfjs-dist';
import * as path from 'path';
import * as fs from 'fs';

// 封装错误处理和日志记录
const logError = (message: string, error: any) => {
  console.error(`${message}:`, error);
};


/**
 * PDF解析器类
 */
export class PdfParser {
  private filename: string;
  private ragName: string;
  private baseDocName: string;
  private pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;

  /**
   * 构造函数
   * @param filename PDF文件路径
   */
  constructor(filename: string, ragName: string) {
    this.filename = filename;
    this.ragName = ragName;
    this.baseDocName = path.basename(filename, path.extname(filename));
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
   * 提取一个页面的文本内容
   * @param page PDF页面
   * @returns 页面文本内容
   */
  private async extractPageText(page: pdfjsLib.PDFPageProxy): Promise<string> {
    const textContent = await page.getTextContent();
    let lastY;
    let textChunks: string[] = [];
    let currentChunk = '';

    const sanitizeText = (text: string) => {
      return text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
    };

    for (const item of textContent.items) {
      if (lastY !== undefined && Math.abs(lastY - item.transform[5]) > 3) {
        if (currentChunk) {
          textChunks.push(sanitizeText(currentChunk));
          currentChunk = '';
        }
      }
      currentChunk += item.str;
      lastY = item.transform[5];
    }

    if (currentChunk) {
      textChunks.push(sanitizeText(currentChunk));
    }
    const pageText = textChunks.join('\n');
    return pageText;
  }

  /**
   * 解析PDF文件
   * @returns Markdown格式的内容
   */
  public async parse(): Promise<string> {
    if (!(await this.initPdfDocument()) || !this.pdfDocument) {
      return '';
    }

    let markdownContent: string[] = [];
    markdownContent.push(`# ${this.baseDocName}\n`);

    const numPages = this.pdfDocument.numPages;

    const pagePromises = Array.from({ length: numPages }, async (_, pageIndex) => {
      const pageNum = pageIndex + 1;
      try {
        const page = await this.pdfDocument!.getPage(pageNum);

        const pageText = await this.extractPageText(page);
        if (pageText) {
          markdownContent.push(pageText);
          markdownContent.push('\n');
        }

      } catch (pageError) {
        logError(`处理页面 ${pageNum} 失败`, pageError);
        markdownContent.push(`无法处理此页面内容，发生错误。\n`);
      }
      markdownContent.push('\n');
    });

    await Promise.all(pagePromises);

    this.dispose();

    return markdownContent.join('\n');
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