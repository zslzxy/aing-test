## 开发方式建议

1. 在外层运行`yarn dev-electron`启动本地服务
2. 进入`frontend`目录,运行`yarn dev`

## 开发规范

1. 目前已支持naive自动导入，无需再手动引入
2. 所有视图开发全面模板化，非必要不要使用tsx
3. 所有独立功能都含有：`components`、`controller`、`store`三个层级结构

## 样式

1. 预编译——sass
   1. base.scss是全局样式预设和混入，如果要使用混入，请全局搜索【@use】，参照已有代码的用法
2. 样式框架——unocsss
   1. clsss样式语法和tailwind一样
   2. icon使用请前往 (https://icones.js.org/)[icones]
