/**
 * @description 打开文件
 */
export function openFile(filePath: string) {
    window.open(`file://${filePath}`)
}