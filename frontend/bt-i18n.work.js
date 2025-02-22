import { promises as asyncFs, stat } from "fs";
import path from "path";
/**
 * @description 基础配置
 */
const config = {
  baseDir: "./src",
  translateConfigDir: "./src/bt-i18n",
  defaultZhConfig: "./src/bt-i18n/zh.panel_source.js",
  expectionExts: ["vue", "js", "ts", "tsx", "json"],
  expectionDirs: ["views", "stores", "router","utils"]
}


/**
 * @description 匹配文件内容中所有的连续中文(废弃)
 * @param source 文件内容
 * @returns String[]
 */
function findChineseCharacter(source) {
  const chineseRegex = /(?<!\/\/.*)(?<!\/\*[\s\S]*?\*\/)(?<!<!--[\s\S]*?-->)[\u4e00-\u9fa5]+/g;
  return source.match(chineseRegex);
}
/**
 * @description 匹配$t()语法的第一个参数
 */
function findTFirstArg(source) {
  const chineseRegex = /\$t\(['"]([^'"]*)['"]/g;
  const res = []
  let matches

  while (matches = chineseRegex.exec(source)) {
    res.push(matches[1])
  }

  const globalTRes = findGlobalTChinese(source)

  return [...res, ...globalTRes]
}

/**
 * @description 匹配i18n.global.t()的中文
 */
function findGlobalTChinese(source) {
  const chineseRegex = /i18n\.global\.t\(["']([^"']*)["']\)/g;
  const res = []
  let matches
  while (matches = chineseRegex.exec(source)) {
    res.push(matches[1])
  }
  return res
}

/**
 * @description 注释脱敏，将文档中的注释内容替换为--
 */
function commentDesensitization(content) {
  const multilineComment = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)/g  // 单行与多行注释
  const htmlComment = /<!--[\s\S]*?-->/g  // html注释
  const noHtmlComment = content.replace(htmlComment, "--")
  const noComment = noHtmlComment.replace(multilineComment, "--")
  return noComment
}


/**
 * @description 判断是否为希望寻找的文件后缀
 * @param file 带有后缀的文件名
 */
function isExpectionFile(file) {
  const fileStrArr = file.split(".")
  return config.expectionExts.includes(fileStrArr[fileStrArr.length - 1])
}



/**
 * @description 通过nodeJS深度遍历一个目录的，并找到所有指定文件(.vue, .js, .ts, .tsx)
 * @param dirPath 需要深度遍历的目录地址
 * 
 * @return 所有被找到符合限定后缀的文件（一维数组）
 */
async function fileContentStream(dirPath) {
  const fileArr = []
  try {
    const files = await asyncFs.readdir(dirPath);
    for (let fileItem of files) {
      const stats = asyncFs.stat(path.resolve(dirPath, fileItem))
      if ((await stats).isFile() && isExpectionFile(fileItem)) {
        fileArr.push(path.resolve(dirPath, fileItem))
      } else if ((await stats).isDirectory()) {
        const childrenFiles = await fileContentStream(path.resolve(dirPath, fileItem))
        fileArr.push(...childrenFiles)
      }
    }

  } catch (err) {
    console.log(err);
  }
  return fileArr
}

/**
 * @description 
 *    - 获取限定的目录 
 *    - 此处目录位置决定于config配置
 */
async function readLimitDirs() {
  const dirList = []
  config.expectionDirs.forEach(item => dirList.push(path.resolve(config.baseDir, item)))
  const filesList = []
  try {
    for (let i = 0; i < dirList.length; i++) {
      const list = await fileContentStream(dirList[i])
      filesList.push(...list)
    }
  } catch (err) {
    console.log(err)
  }
  // 将中间件文件追加进去
  return filesList
}


/**
 * @description 读取给定文件的内容
 * @param file 需要读取内容的文件绝对路径
 */
async function getFileContent(file) {
  let contentCollection = ""
  try {
    contentCollection = await asyncFs.readFile(file, "utf-8")
  } catch (err) {
    console.log(err)
  }
  return contentCollection
}


/**
 * @description 
 *    - 获取所有文件
 *    - 读取文件内容
 *    - 清除内容注释
 *    - 抽取内容中文
 */
async function doTranslate() {
  try {
    // 读取文件
    const fileCollection = await readLimitDirs()
    // 读取文件内容
    const contentCollection = []
    const jsonCharacterKeys = []
    for (let i = 0; i < fileCollection.length; i++) {
      if (path.extname(fileCollection[i]) == ".json") {
        const obj = await asyncFs.readFile(fileCollection[i], "utf-8");
        const jsonValues = Object.values(JSON.parse(obj))
        for (let i = 0; i < jsonValues.length; i++) {
          jsonValues[i].loading && jsonCharacterKeys.push(jsonValues[i].loading)
          jsonValues[i].confirm && jsonValues[i].confirm.length && jsonCharacterKeys.push(...jsonValues[i].confirm)
        }
      } else {
        const content = await getFileContent(fileCollection[i]);
        contentCollection.push(content)
      }
    }
    // 内容注释脱敏
    const noCommentCotentCollection = []
    contentCollection.forEach(item => noCommentCotentCollection.push(commentDesensitization(item)))
    // 抽取文件中文
    const chineseCharacterCollection = []
    noCommentCotentCollection.forEach(item => findTFirstArg(item) && chineseCharacterCollection.push(findTFirstArg(item)))
    // 合并数组并去重
    const characterKeys = chineseCharacterCollection.flat()
    return [...new Set(characterKeys),...new Set(jsonCharacterKeys)]
  } catch (err) {
    console.log(err)
  }
}

/**
 * @description 对比数组成员是否存在于对象的key中，返回由对象不具备的key组成的数组
 */
function objExcludeKeys(keyArr, sourceObj) {
  const sourceKeys = Object.keys(sourceObj);
  return keyArr.filter(item => !sourceKeys.includes(item))
}

/**
 * @description 将key数组转化为翻译后的对象并返回
 */
function excludeKeysTotranslatedObj(excludeKeys) {
  return excludeKeys.reduce((p, v) => {
    return { ...p, ...{ [v]: v } }
  }, {})
}



/**
 * @description 读取已有中文配置对象,如果没有则创建，并写入内容
 */
async function readZhLangConfig() {
  await doTranslate()
  try {
    await asyncFs.access(config.translateConfigDir);  // 如果文件存在则直接到finally读取文件内容对象，否则执行创建
    await asyncFs.writeFile(path.resolve(config.translateConfigDir, "zh.panel_source.js"), `
      export default {

      }
    `)
  } catch (err) {
    try {
      await asyncFs.mkdir(config.translateConfigDir)
      await asyncFs.writeFile(path.resolve(config.translateConfigDir, "zh.panel_source.js"), `
      export default {

      }
    `)
    } catch (err) {
      console.log(err)
    }
  } finally {
    const langConfig = (await import(config.defaultZhConfig)).default
    // 得到所有抽取的中文，与原本配置对象比对，得出不一样的中文
    const translateWait = await doTranslate(config.baseDir)
    const excludeKeys = objExcludeKeys(translateWait, langConfig)
    // 将所有中文组成对象并追加到配置对象中
    const newTranslateConfig = { ...langConfig, ...excludeKeysTotranslatedObj(excludeKeys) }
    await asyncFs.writeFile(path.resolve(config.defaultZhConfig), `export default ${JSON.stringify(newTranslateConfig)}`)
  }
}


readZhLangConfig().then(res => {
  console.log(res)
})
