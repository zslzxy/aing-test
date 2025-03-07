import { defineConfig, presetIcons, presetUno } from 'unocss'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import path from 'node:path'
import { globSync } from 'glob'

function getIcons() {
  const icons = {}
  const files = globSync('src/assets/icons/**/*.svg', { nodir: true })
  files.forEach((filePath) => {
    const fileName = path.basename(filePath) // 获取文件名，包括后缀
    const fileNameWithoutExt = path.parse(fileName).name // 获取去除后缀的文件名
    const folderName = path.basename(path.dirname(filePath)) // 获取文件夹名
    if (!icons[folderName]) {
      icons[folderName] = []
    }
    icons[folderName].push(`i-${folderName}:${fileNameWithoutExt}`)
  })
  return icons
}

const icons = getIcons()
const collections = Object.fromEntries(
  Object.keys(icons).map((item) => [item, FileSystemIconLoader(`src/assets/icons/${item}`)])
)
export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      warn: true,
      prefix: ['i-'],
      extraProperties: {
        display: 'inline-block',
        // color:"currentColor",
      },
      collections,
    })
  ],
  theme: {
    colors: {
      "bt-theme": "#16a34a"  // 堡塔主题色
    }
  },
  rules: [
    [/^fz-(\d+)$/, (match) => ({ 'font-size': `${match[1]}px` })],
    [/^fw-(\w+)$/, (match) => ({ 'font-weight': `${match[1]}` })],
    [/^c-([0-9a-fA-F]{6})$/, (match) => ({ color: `#${match[1]}` })], // 仅支持16进制，且必须全写
    [/^w-(\d+)$/, (match) => ({ width: `${match[1]}px` })],
    [/^h-(\d+)$/, (match) => ({ height: `${match[1]}px` })],
    [/^mt-(\d+)$/, (match) => ({ 'margin-top': `${match[1]}px` })],
    [/^mr-(\d+)$/, (match) => ({ 'margin-right': `${match[1]}px` })],
    [/^mb-(\d+)$/, (match) => ({ 'margin-bottom': `${match[1]}px` })],
    [/^ml-(\d+)$/, (match) => ({ 'margin-left': `${match[1]}px` })],
    [/^pt-(\d+)$/, (match) => ({ 'padding-top': `${match[1]}px` })],
    [/^pr-(\d+)$/, (match) => ({ 'padding-right': `${match[1]}px` })],
    [/^pb-(\d+)$/, (match) => ({ 'padding-bottom': `${match[1]}px` })],
    [/^pl-(\d+)$/, (match) => ({ 'padding-left': `${match[1]}px` })],
    [/^pl-(\d+)$/, (match) => ({ 'padding-left': `${match[1]}px` })]
  ]
})
