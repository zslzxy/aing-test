import { LanceDBManager } from './vector_database/vector_lancedb';
import { pub } from '../class/public';
import { Rag } from './rag';


export class RagTask {
    private docTable = 'doc_table';


    /**
     * 获取未解析文档
     * @returns Promise<any>
     */
    async getNotParseDocument(): Promise<any> {
        let result = await LanceDBManager.queryRecord(this.docTable, "is_parsed=0");
        return result;
    }


    /**
     * 文档分割 - 将长文本分割成小块，尊重Markdown文档结构
     * @param docBody 待分割的文档内容
     * @returns 分割后的文本块数组
     */
    public async docChunk(docBody: string): Promise<string[]> {
        // 每个块的最大字符数
        const chunkSize = 500;
        // 重叠区域的字符数，确保上下文连贯性
        const overlapSize = 15;
        // 最小块大小阈值，小于此值不设置重叠区域
        const minSizeForOverlap = 60;
        
        // 处理空文档情况
        if (!docBody || docBody.trim().length === 0) {
            return [];
        }
        
        const chunks: string[] = [];
        
        // 首先按照Markdown标题分割（# 开头的行）
        const headingRegex = /^#{1,6}\s+.+$/gm;
        const headingMatches = [...docBody.matchAll(headingRegex)];
        
        if (headingMatches.length > 1) {
            // 有明确的Markdown标题结构，按标题分块
            const sections: string[] = [];
            
            for (let i = 0; i < headingMatches.length; i++) {
                const currentMatch = headingMatches[i];
                const nextMatch = headingMatches[i + 1];
                
                const startIdx = currentMatch.index!;
                const endIdx = nextMatch ? nextMatch.index! : docBody.length;
                
                sections.push(docBody.substring(startIdx, endIdx));
            }
            
            // 对每个部分进一步处理
            for (const section of sections) {
                if (section.length <= chunkSize) {
                    chunks.push(section.trim());
                } else {
                    // 如果部分太长，进一步分割
                    const subChunks = this.splitTextBySize(section, chunkSize, overlapSize, minSizeForOverlap);
                    chunks.push(...subChunks);
                }
            }
        } else {
            // 没有明确的标题结构，尝试按照Markdown列表、代码块等分割
            const mdBlockRegex = /```[\s\S]*?```|^\s*[*+-]\s+.*$(?:\n^\s*[*+-]\s+.*$)*/gm;
            const mdBlocks = [...docBody.matchAll(mdBlockRegex)];
            
            if (mdBlocks.length > 0) {
                // 处理Markdown块和块之间的文本
                let lastEnd = 0;
                
                for (const block of mdBlocks) {
                    // 先处理块前的文本
                    if (block.index! > lastEnd) {
                        const textBefore = docBody.substring(lastEnd, block.index!);
                        const textChunks = this.splitTextBySize(textBefore, chunkSize, overlapSize, minSizeForOverlap);
                        chunks.push(...textChunks);
                    }
                    
                    // 处理Markdown块本身
                    const blockContent = block[0];
                    if (blockContent.length <= chunkSize) {
                        chunks.push(blockContent.trim());
                    } else {
                        const blockChunks = this.splitTextBySize(blockContent, chunkSize, overlapSize, minSizeForOverlap);
                        chunks.push(...blockChunks);
                    }
                    
                    lastEnd = block.index! + block[0].length;
                }
                
                // 处理最后一个块后的文本
                if (lastEnd < docBody.length) {
                    const textAfter = docBody.substring(lastEnd);
                    const textChunks = this.splitTextBySize(textAfter, chunkSize, overlapSize, minSizeForOverlap);
                    chunks.push(...textChunks);
                }
            } else {
                // 没有特定Markdown结构，按段落分割
                const textChunks = this.splitTextBySize(docBody, chunkSize, overlapSize, minSizeForOverlap);
                chunks.push(...textChunks);
            }
        }
        
        return chunks;
    }
    
    /**
     * 辅助方法：按大小分割文本
     */
    private splitTextBySize(text: string, chunkSize: number, overlapSize: number, minSizeForOverlap: number): string[] {
        const chunks: string[] = [];
        const paragraphs = text.split('\n\n');
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            // 如果段落本身就超过了块大小，则需要进一步分割
            if (paragraph.length > chunkSize) {
                // 如果当前块不为空，先保存它
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    currentChunk = '';
                }
                
                // 将段落按单换行符进一步分割
                const lines = paragraph.split('\n');
                for (const line of lines) {
                    // 如果当前行加入后会超出块大小，先保存当前块
                    if (currentChunk.length + line.length > chunkSize && currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                        
                        // 只有当块足够大时才保留重叠部分
                        if (currentChunk.length >= minSizeForOverlap) {
                            currentChunk = currentChunk.slice(-overlapSize);
                        } else {
                            currentChunk = '';
                        }
                    }
                    
                    // 添加当前行到块中
                    currentChunk += line + '\n';
                }
            } else {
                // 如果加入当前段落后会超出块大小，先保存当前块
                if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    
                    // 只有当块足够大时才保留重叠部分
                    if (currentChunk.length >= minSizeForOverlap) {
                        currentChunk = currentChunk.slice(-overlapSize);
                    } else {
                        currentChunk = '';
                    }
                }
                
                // 添加当前段落到块中
                currentChunk += paragraph + '\n\n';
            }
        }
        
        // 添加最后一个块（如果有内容）
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }


    /**
     * 生成文档关键词
     * @param doc:string 文档内容
     * @param num:number 关键词数量，默认为10
     * @returns Promise<string[]> 提取的关键词数组
     */
    public async generateKeywords(doc: string,num:number = 10): Promise<string[]> {
        return [];
    }


    // 后台解析任务
    public async parseTask(){
        const sleep = 5 * 1000
        let self = this;

        setTimeout(async ()=>{
            await self.start()
            self.parseTask()
        },sleep)
    }


    // 当向量数据足够多时，切换到余弦相似度索引
    public async switchToCosineIndex(){
        let tableList = pub.readdir(pub.get_data_path() + "/rag/vector_db")
        let indexTipsPath = pub.get_data_path() + "/rag/index_tips"
        if (!pub.file_exists(indexTipsPath)) {
            pub.mkdir(indexTipsPath)
        }
        
        for(let tablePath of tableList){
            let tableName = tablePath.split('/').pop()?.replace(".lance","")
            // console.log(tableName,tableName?.length)
            if (tableName?.length !== 32) {
                continue
            }

            let indexTipFile = indexTipsPath + "/" + tableName + ".pl"
            if (pub.file_exists(indexTipFile)) {
                continue
            }

            if(await LanceDBManager.tableCount(tableName) > 256) {
                await LanceDBManager.addIndex(tableName,[{type: 'ivfPq',key: 'vector'}])
                pub.write_file(indexTipFile,"1")
            }
        }
    }



    /**
     * 开始对文档进行处理
     * @returns Promise<string>
     */
    public async start(){
        try{
            let notParseDocument = await this.getNotParseDocument()
            let dataDir = pub.get_data_path()
            let repDataDir = '{DATA_DIR}'
            let ragObj = new Rag()
            for(let doc of notParseDocument){
                let md_file =  doc.md_file.replace(repDataDir, dataDir)
                if(!pub.file_exists(md_file)){
                    continue
                }
                let md_body = pub.read_file(md_file)
                let chunks =  await this.docChunk(md_body)

                let chunkList:any[] = []
                for(let chunk of chunks){
                    let chunkInfo = {
                        text: chunk,
                        docId: doc.doc_id,
                        keywords: await this.generateKeywords(chunk)
                    }
                    chunkList.push(chunkInfo)
                }

                let table = pub.md5(doc.doc_rag)
                let ragInfo:any = await ragObj.getRagInfo(doc.doc_rag)
                for (let checkInfo of chunkList){
                    await LanceDBManager.addDocument(table,ragInfo.supplierName,ragInfo.embeddingModel,checkInfo.text,checkInfo.keywords,checkInfo.docId)
                }

                // 更新文档状态
                await LanceDBManager.updateRecord(this.docTable,{where: `doc_id='${doc.doc_id}'`,values: {is_parsed: 1}})
            }
            return notParseDocument;
        }catch(e){
            console.log(e)
            return e
        }
    }
}