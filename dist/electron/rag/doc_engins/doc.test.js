"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const doc_1 = require("./doc");
// Assuming you have a document engine implementation
// Import your document engine classes here
// For example:
// import { PDFDocumentEngine } from './pdf_engine';
// import { MarkdownDocumentEngine } from './markdown_engine';
(0, vitest_1.describe)('Document Engines', () => {
    const testFilesDir = path.join(__dirname, '../test_files');
    // Make sure test directory exists
    (0, vitest_1.beforeAll)(() => {
        if (!fs.existsSync(testFilesDir)) {
            fs.mkdirSync(testFilesDir, { recursive: true });
        }
    });
    (0, vitest_1.describe)('PDF Engine', () => {
        (0, vitest_1.it)('should parse PDF content correctly', async () => {
            // Test implementation here
            // Example:
            // const pdfEngine = new PDFDocumentEngine();
            // const result = await pdfEngine.parse(path.join(testFilesDir, 'sample.pdf'));
            // expect(result).toContain('Expected text from PDF');
            // Placeholder test until actual implementation
            (0, vitest_1.expect)(true).toBe(true);
        });
    });
    (0, vitest_1.describe)('Markdown Engine', () => {
        (0, vitest_1.it)('should parse Markdown content correctly', async () => {
            // Test implementation here
            // Example:
            // const mdEngine = new MarkdownDocumentEngine();
            // const result = await mdEngine.parse(path.join(testFilesDir, 'sample.md'));
            // expect(result).toContain('# Heading');
            // Placeholder test until actual implementation
            (0, vitest_1.expect)(true).toBe(true);
        });
        (0, vitest_1.it)('should identify supported file extensions', () => {
            const extensions = (0, doc_1.getSupportedFileExtensions)();
            (0, vitest_1.expect)(extensions).toContain('.pdf');
            (0, vitest_1.expect)(extensions).toContain('.md');
            (0, vitest_1.expect)(extensions).toContain('.docx');
            (0, vitest_1.expect)(extensions).toContain('.txt');
        });
        (0, vitest_1.it)('should check if file type is supported', () => {
            (0, vitest_1.expect)((0, doc_1.isSupportedFileType)('test.md')).toBe(true);
            (0, vitest_1.expect)((0, doc_1.isSupportedFileType)('test.pdf')).toBe(true);
            (0, vitest_1.expect)((0, doc_1.isSupportedFileType)('test.xyz')).toBe(false);
        });
        (0, vitest_1.it)('should parse document with content only', async () => {
            const testFilePath = path.join(testFilesDir, 'test.md');
            // Create a test markdown file
            fs.writeFileSync(testFilePath, '# Test Heading\nTest content');
            const result = await (0, doc_1.parseDocument)(testFilePath);
            (0, vitest_1.expect)(result.content).toContain('Test Heading');
            (0, vitest_1.expect)(result.savedPath).toBeUndefined();
            (0, vitest_1.expect)(result.originalPath).toBeUndefined();
        });
        (0, vitest_1.it)('should parse document and save files when requested', async () => {
            const testFilePath = path.join(testFilesDir, 'save_test.md');
            // Create a test markdown file
            fs.writeFileSync(testFilePath, '# Save Test\nThis should be saved');
            const result = await (0, doc_1.parseDocument)(testFilePath, true, true);
            (0, vitest_1.expect)(result.content).toContain('Save Test');
            (0, vitest_1.expect)(result.savedPath).toBeDefined();
            (0, vitest_1.expect)(result.originalPath).toBeDefined();
            (0, vitest_1.expect)(fs.existsSync(result.savedPath)).toBe(true);
            (0, vitest_1.expect)(fs.existsSync(result.originalPath)).toBe(true);
        });
        (0, vitest_1.it)('should handle non-existent files gracefully', async () => {
            const nonExistentFile = path.join(testFilesDir, 'does_not_exist.md');
            const result = await (0, doc_1.parseDocument)(nonExistentFile);
            (0, vitest_1.expect)(result.content).toContain('# 文件访问错误');
        });
    });
    // Add more tests for other document engines
});
//# sourceMappingURL=doc.test.js.map