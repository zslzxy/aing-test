const { notarize } = require("electron-notarize");




exports.default = async function notarizing(context) {

    try {

        const { electronPlatformName, appOutDir } = context;

        if (electronPlatformName !== "darwin") {

            return;

        }

        const appName = context.packager.appInfo.productFilename;

        console.log(

            `mac开始公正，公正工具notarytool,打包后应用地址：${appOutDir}/${appName}.app`

        );

        // appBundleId @1: 准备工作中获得的bundle id，即你的应用的appId。
        // appleId @2: 苹果开发者ID。（如果是公司的账号的话，需要最高权限的账号）
        // appleIdPassword @3: 准备工作中获得专用密码。

        const result = notarize({
            appBundleId: 'com.bt.AingDesk',
            appPath: `${appOutDir}/${appName}.app`,
            appleId: 'btpanel@qq.com',
            appleIdPassword: 'uuwr-gtmx-rzkm-srty',
            ascProvider: "2F4KRSK2CH",
            tool: "notarytool", // 公证工具 固定写法
            teamId: "2F4KRSK2CH",
        });

        console.log("mac公正 Notarization result:", result);

        return result;

    } catch (error) {

        console.log("mac公正 出错了");

        console.error(error);

    }

};
