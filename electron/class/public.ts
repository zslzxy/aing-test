import * as crypto from 'crypto';
import * as fs from 'fs';
import { v1 as uuidv1 } from 'uuid';
import NodeCache from 'node-cache';
import * as path from 'path';
import * as Ps from 'ee-core/ps';
import { execSync } from 'child_process';

type ReturnMsg = {
    status:number, // 状态 0成功 -1失败
    code:number, // 状态码
    msg:string,  // 消息
    error_msg:string, // 错误消息
    message:any // 响应数据
}


// 创建缓存
const Cache = new NodeCache({ stdTTL: 360, checkperiod: 7200 });

class Public {

    // 计算MD5
    md5(str: string): string {
        const hash = crypto.createHash('md5');
        hash.update(str);
        return hash.digest('hex');
    }

    // 计算SHA1
    sha1(str: string): string {
        const hash = crypto.createHash('sha1');
        hash.update(str);
        return hash.digest('hex');
    }

    // 计算SHA256
    sha256(str: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(str);
        return hash.digest('hex');
    }


    // 计算SHA512
    sha512(str: string): string {
        const hash = crypto.createHash('sha512');
        hash.update(str);
        return hash.digest('hex');
    }

    // 判断文件是否存在
    file_exists(file: string): boolean {
        return fs.existsSync(file);
    }

    // 读取文件
    read_file(file: string): string {
        if (!fs.existsSync(file)) {
            return '';
        }
        return fs.readFileSync(file, 'utf-8');
    }

    // 写文件
    write_file(file: string, content: string): void {
        fs.writeFileSync(file, content);
    }

    // 删除文件
    delete_file(file: string): void {
        if (!fs.existsSync(file)) {
            return;
        }
        fs.unlinkSync(file);
    }


    // 创建文件夹
    mkdir(dir: string): void {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }


    // 删除文件夹
    rmdir(dir: string): void {
        if (!fs.existsSync(dir)) {
            return;
        }
        fs.rmdirSync(dir, { recursive: true });
    }


    // 读取文件夹
    readdir(dir: string): string[] {
        if (!fs.existsSync(dir)) {
            return [];
        }
        let dirList =  fs.readdirSync(dir);
        let resultList:string[] = [];
        
        for (let i = 0; i < dirList.length; i++) {
            resultList.push(dir + "/" +dirList[i]);
        }
        return resultList;
    }

    // 获取文件信息
    stat(file: string): fs.Stats {
        if (!fs.existsSync(file)) {
            return new fs.Stats();
        }
        return fs.statSync(file);
    }


    // 获取文件大小
    filesize(file: string): number {
        let fileStat = this.stat(file);
        if (fileStat.size == undefined) {
            return 0;
        }
        return fileStat.size;
    }

    // 获取文件创建时间
    filectime(file: string): number {
        let fileStat = this.stat(file);
        if (fileStat.ctimeMs == undefined) {
            return 0;
        }
        return fileStat.ctimeMs;
    }

    // 获取文件修改时间
    filemtime(file: string): number {
        let fileStat = this.stat(file);
        if (fileStat.mtimeMs == undefined) {
            return 0;
        }
        return fileStat.mtimeMs;
    }

    // 获取uuid
    uuid(): string {
        return uuidv1();
    }


    /**
     * @name 获取语言包目录
     * @returns {string} 语言包目录
     */
    get_language_path(){
        return path.resolve(Ps.getExtraResourcesDir() , 'languages');
    }

    /**
     * @name 判断是否为文件
     * @param {string} path 文件路径
     * @returns {bool} 是否为文件
     * @example is_file('/www/wwwroot/index.html')
     */
    is_file(path){
        return fs.existsSync(path) && fs.statSync(path).isFile();
    }

    /**
     * @name 获取根目录
     * @returns {string} 根目录
     * @example get_root_path()
     */
    get_root_path():string{
        return Ps.getRootDir()
    }
        
    /**
     * @name 获取数据目录
     * @returns {string} 数据目录
     */
    get_data_path():string{
        // 获取用户数据目录
        let data_path = path.resolve(this.get_root_path(),'data');

        // 如果不存在则创建
        if (!fs.existsSync(data_path)) {
            fs.mkdirSync(data_path);
        }
        return data_path;
    }

    /**
     * 获取资源目录
     */
    get_resource_path():string{
        return Ps.getExtraResourcesDir();
    }


    /**
     * @name 获取上下文存储目录
     * @returns {string} 上下文存储目录
     */
    get_context_path(uuid:string):string{
        // 获取用户数据目录
        let context_save_path = path.resolve(this.get_data_path(),'context');

        // 如果不存在则创建
        if (!fs.existsSync(context_save_path)) {
            fs.mkdirSync(context_save_path);
        }

        // 创建uuid目录
        let context_path = path.resolve(context_save_path,uuid);
        if (!fs.existsSync(context_path)) {
            fs.mkdirSync(context_path);
        }

        // 返回目录
        return context_path;
    }

    /**
     * @name 获取上下文存储目录
     * @returns {string} 上下文存储目录
     */
    get_share_context_path(shareId:string,contextId:string):string{
        // 获取用户数据目录
        let context_save_path = path.resolve(this.get_data_path(),'share',shareId,'context');

        // 如果不存在则创建
        if (!fs.existsSync(context_save_path)) {
            fs.mkdirSync(context_save_path);
        }

        // 创建uuid目录
        let context_path = path.resolve(context_save_path,contextId);
        if (!fs.existsSync(context_path)) {
            fs.mkdirSync(context_path);
        }

        // 返回目录
        return context_path;
    }


    /**
     * @name 获取配置项
     * @param {string} key 配置项
     * @returns {any}
     */
    config_get(key:string):any{
        let config_file = path.resolve(this.get_data_path() , 'config.json');
        if(!fs.existsSync(config_file)) {
            let default_config = {"max_common_use":10}
            this.write_file(config_file,JSON.stringify(default_config));
        }
        let config = JSON.parse(this.read_file(config_file));
        if(key === undefined) return config;
        return config[key];
    }

    /**
     * @name 设置配置项
     * @param {string} key 
     * @param {any} value 
     */
    config_set(key:string,value:any){
        return this.C(key,value);
    }


    /**
     * @name 读取或设置配置项
     * @param {string} key 配置项 [必填]
     * @param {string} value 配置值 [选填] 如果没有值则为读取配置项
     * @returns {any}
     * @example C('test','123')
     */
    C(key:string,value?:any):any{
        if(!key) return;
        if(value === undefined) return this.config_get(key);

        let config_file = path.resolve(this.get_data_path() , 'config.json');
        let config = {};
        if(fs.existsSync(config_file)){
            config = JSON.parse(this.read_file(config_file));
        }
        config[key] = value;
        this.write_file(config_file,JSON.stringify(config));
    }


    /**
     * @name 获取当前语言
     * @returns {string}
     * @example get_language()
     */
    get_language(){
        let lang = this.cache_get('language');
        if(lang) return lang;
        lang =  this.C('language');
        if(!lang){
            // 获取系统语言
            try{
                let lang_full = Intl.DateTimeFormat().resolvedOptions().locale;
                lang = lang_full.split('-')[0];
            }catch(e){
                lang = 'zh';
            }
        }

        // 缓存
        this.cache_set('language',lang,3600);

        return lang;
    }

    /**
     * @name 获取当前语言和支持的语言列表
     * @returns {Object} 返回结果
     */
    get_languages() {
        // 判断缓存
        let data = this.cache_get('languages');
        if(data) return data;

        let filename = path.resolve(this.get_language_path(), 'settings.json');
        let body = this.read_file(filename)
        if(!body){
            body = `{
                "name": "zh",
                "google": "zh-cn",
                "title": "简体中文",
                "cn": "简体中文"
            },
            {
                "name": "en",
                "google": "en",
                "title": "English",
                "cn": "英语"
            }`
        }
        let current = this.get_language();
        data = {
            languages: JSON.parse(body),
            current: current
        };

        // 缓存
        this.cache_set('languages',data,3600);
        return data;
    }
    /**
     * @name 获取客户端语言包
     * @returns {Object} 返回结果
     */
    get_client_language() {
        // 判断缓存
        let client_lang = this.cache_get('client_lang');
        if(client_lang) return client_lang;

        let language = this.get_language();
        let language_path = this.get_language_path();
        let filename = path.resolve(language_path, language+'/client.json');
        if(!this.is_file(filename)){
            filename = path.resolve(language_path,'en/client.json');
        }
        let body = this.read_file(filename)
        if (!body) {
            body = '{}'
        }

        client_lang = JSON.parse(body);

        // 缓存
        this.cache_set('client_lang',client_lang,3600);

        return client_lang
    }

    /**
     * @name 多语言渲染
     * @param {string} content - 内容
     * @param {any[]} args - 参数
     * @returns {string}
     * @example lang('Hello {}', 'World')
     * @example lang('Hello {} {}', 'World', '!')
     * @example lang('Hello')
     */
    lang(content,...args){
        // 获取语言包
        let lang_dataValue = this.cache_get('lang_data');
        let lang_data:object = {};
        if (lang_dataValue && typeof lang_dataValue == 'object') {
            lang_data = lang_dataValue as object;
        }

        if(Object.keys(lang_data).length == 0){
            let lang = this.get_language();
            if (typeof lang !== 'string') {
                lang = 'zh';
            }
            let lang_file = path.resolve(this.get_language_path(), lang as string , 'server.json');
            lang_data = {};
            if(fs.existsSync(lang_file)) {
                lang_data = JSON.parse(this.read_file(lang_file));
            }
        }

        // 尝试从语言包中获取内容
        let lang_content = content;
        let hash = this.md5(content);
        if(lang_data[hash]){
            lang_content = lang_data[hash];
        }

        // 替换参数
        if(args.length > 0){
            lang_content = lang_content.replace(/{}/g, function() {
                return args.shift();
            });
        }

        // 返回内容
        return lang_content;
    }


    
    /**
     * @name 获取缓存
     * @param {any} key 缓存键
     * @returns 
     */
    cache_get(key:any):any{
        return Cache.get(key);

    }

    /**
     * @name 设置缓存
     * @param {any} key 缓存键
     * @param {any} value 缓存值
     * @param {number} expire 过期时间
     * @returns 
     */
    cache_set(key:any,value:any,expire:number){
        if (!expire) expire = 0;
        return Cache.set(key,value,expire);
    }

    /**
     * @name 删除缓存
     * @param {any} key 缓存键
     * @returns 
     */
    cache_del(key:any){
        return Cache.del(key);
    }

    /**
     * @name 清空缓存
     * @returns 
     */
    cache_clear(){
        return Cache.flushAll();
    }

    /**
     * @name 判断缓存是否存在
     * @param {any} key 缓存键
     * @returns
     * @example cache_has('key')
     */
    cache_has(key:any){
        return Cache.has(key);
    }

    // {
    //     "status":0,
    //     "code":200,
    //     "msg":"安装任务创建成功",
    //     "error_msg":"",
    //     "message":{
    //          "task_id":"xxxxxxxxx"
    //     }
                
    // }


    /**
     * 通用返回消息
     * @param {number} status 状态 0成功 -1失败
     * @param {number} code 状态码
     * @param {string} msg 消息
     * @param {string} error_msg 错误消息
     * @param {any} message 响应数据
     * @returns {ReturnMsg}
     */
    return_msg(status:number,code:number,msg:string,error_msg:string,message:any):ReturnMsg{
        return {
            status:status,
            code:code,
            msg:msg,
            error_msg:error_msg,
            message:message
        }
    }

    /**
     * 返回成功消息
     * @param {string} msg 消息
     * @param {any} message 响应数据
     * @returns {ReturnMsg}
     */
    return_success(msg:string,message?:any):ReturnMsg{
        return this.return_msg(0,200,msg,'',message);
    }

    /**
     * 返回失败消息
     * @param {string} msg 消息
     * @param {string} error_msg 响应数据
     * @returns {ReturnMsg}
     */
    return_error(msg:string,error_msg:any):ReturnMsg{
        return this.return_msg(-1,500,msg,error_msg,'');
    }

    /**
     * 简化响应消息
     * @param {bool} status 消息
     * @param {string} msg 提示消息
     * @param {any} message 响应数据
     * @returns {ReturnMsg}
     */
    return_simple(status:boolean,msg:string,message:any):ReturnMsg{
        return this.return_msg(status?0:-1,status?200:500,msg,'',message);
    }


    /**
     * @name 执行cmd/shell命令
     * @param {string} cmd 命令
     * @returns {string} 返回结果
     */
    exec_shell(cmd:string):string{
        return execSync(cmd).toString();
    }


    /**
     * @name 获取当前时间
     * @returns {number} 返回当前时间戳(秒级)
     */
    time():number{
        return Math.round(new Date().getTime()/1000);
    }


    // 判断是否为Windows系统
    is_windows():boolean{
        return process.platform === 'win32';
    }

    // 判断是否为Linux系统
    is_linux():boolean{
        return process.platform === 'linux';
    }

    // 判断是否为Mac系统
    is_mac():boolean{
        return process.platform === 'darwin';
    }


    // 更新系统环境变量
    update_env(): void {
        try {
            let newEnv: { [key: string]: string } = {};
            if (process.platform === 'win32') {
                newEnv = this.getWindowsEnv();
            } else {
                newEnv = this.getNonWindowsEnv();
            }
            // 更新环境变量
            this.updateProcessEnv(newEnv);
            console.info('env updated');
        } catch (error) {
            if (error instanceof Error) {
                console.error(`env update error: ${error.message}`);
            } else {
                console.error('env update error:', error);
            }
        }
    }
    // 获取 Windows 系统的环境变量
    private getWindowsEnv(): { [key: string]: string } {
        const output = execSync('powershell -Command "[Environment]::GetEnvironmentVariables()"').toString();
        const lines = output.split('\n');
        // 跳过标题行
        let startIndex = 0;
        while (startIndex < lines.length &&!lines[startIndex].includes('----')) {
            startIndex++;
        }
        startIndex++;
        const newEnv: { [key: string]: string } = {};
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const parts = this.parseEnvLine(line, /\s{2,}/);
                if (parts) {
                    const [key, value] = parts;
                    newEnv[key] = value;
                }
            }
        }
        return newEnv;
    }
    // 获取非 Windows 系统的环境变量
    private getNonWindowsEnv(): { [key: string]: string } {
        const output = execSync('printenv').toString();
        const lines = output.split('\n');
        const newEnv: { [key: string]: string } = {};
        lines.forEach((line) => {
            const parts = this.parseEnvLine(line, '=');
            if (parts) {
                const [key, value] = parts;
                newEnv[key] = value;
            }
        });
        return newEnv;
    }
    // 解析环境变量行
    private parseEnvLine(line: string, separator: string | RegExp): [string, string] | null {
        const parts = line.split(separator);
        if (Array.isArray(parts) && parts.length === 2) {
            const key = parts[0].trim();
            let value = parts[1].trim();
            return [key, value];
        }
        return null;
    }
    // 更新 process.env 对象
    private updateProcessEnv(newEnv: { [key: string]: string }): void {
        Object.assign(process.env, newEnv);
    }

    /**
     * @name 延迟执行
     * @param {number} ms 延迟时间
     * @returns {Promise<void>}
     */
    async sleep(ms:number):Promise<void>{
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }


    /**
     * @name 获取MAC地址
     * @returns string
     */
    get_mac_address():string{
        let mac = '';
        let interfaces = require('os').networkInterfaces();
        for (let dev in interfaces) {
            let iface = interfaces[dev];
            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (alias.family === 'IPv4' && alias.mac !== '00:00:00:00:00:00') {
                    mac = alias.mac;
                    break;
                }
            }
            if(mac) break;
        }
        return mac;
    }

    /**
     * @name 获取设备唯一标识
     * @returns string
     */
    get_device_id():string {
        let mac = this.get_mac_address();
        if(mac) return this.md5(mac);
        return this.md5(this.uuid());
    }

    /**
     * @name 获取软件版本
     * @returns string
     */
    version():string{
        return Ps.appVersion();
    }

    /**
     * @name 获取系统类型
     * @returns string  Windows | Linux | MacOS
     */
    os_type():string{
        if(this.is_windows()) return 'Windows';
        if(this.is_linux()) return 'Linux';
        if(this.is_mac()) return 'MacOS';
        return 'Unknown';
    }

    /**
     * @name 获取客户端ID
     * @returns string
     */
    client_id():string{
        // 64位客户端唯一标识
        let client_id = this.C('client_id');
        if(!client_id){
            // 生成客户端ID
            client_id = this.md5(this.get_device_id()) + this.md5(new Date().getTime().toString());
            this.C('client_id',client_id);
        }
        return client_id;
    }

}

const pub = new Public();
export{ pub,Public };

export type {
    ReturnMsg
}