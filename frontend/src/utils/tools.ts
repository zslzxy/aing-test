/**
 * @description 判断是否为一个数字
 */
export const isNumber = (num: any) => typeof num === 'number'


/**
 * @description 字节转换，到指定单位结束
 * @param { number } bytes 字节数
 * @param { boolean } isUnit 是否显示单位
 * @param { number } fixed 小数点位置
 * @param { string } endUnit 结束单位
 * @returns { string }
 */
export const getByteUnit = (
  bytes: number = 0,
  isUnit: boolean = true,
  fixed: number = 2,
  endUnit: string = ''
): string => {
  let newBytes = isNumber(bytes) ? bytes : Number(bytes)
  const c = 1024
  const units = [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB', ' BB', ' NB', ' DB']
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    const showValue = fixed === 0 ? Math.round(newBytes) : newBytes.toFixed(fixed)
    const result = i === 0 ? newBytes.toFixed(fixed) : showValue
    if (endUnit) {
      if (unit.trim() === endUnit.trim()) {
        return isUnit ? result + unit : `${result}`
      }
    } else if (newBytes < c) {
      return isUnit ? result + unit : `${result}`
    }
    newBytes /= c
  }
  return ''
}


/**
 * @description 年月日时分秒转换方法
 */
export function isoToLocalDateTime(isoStr: string|number) {
  const date = new Date(isoStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * @description 字符串化的数字保留两位小数
 */
export function fixedStrNum(strNum: string | number) {
  // 将字符串转换为数字
  const num = Number(strNum);
  // 检查是否为有效数字
  if (isNaN(num)) {
    return 'null';
  }
  // 保留两位小数
  return Number(num.toFixed(2));

}


/**
 * @description 模拟发送请求
 */
export async function testRequest() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
}