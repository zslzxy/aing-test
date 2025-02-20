import { ElectronEgg } from 'ee-core';
import { Lifecycle } from './preload/lifecycle';
import { preload } from './preload';

import { shareService } from './service/share';
import { totalService } from './service/total';

// New app
const app = new ElectronEgg();

// Register lifecycle
const life = new Lifecycle();
app.register("ready", life.ready);
app.register("electron-app-ready", life.electronAppReady);
app.register("window-ready", life.windowReady);
app.register("before-close", life.beforeClose);
// Register preload
app.register("preload", preload);


// Register service
const shareIdPrefix = shareService.generateUniquePrefix();
shareService.connectToCloudServer(shareIdPrefix);

// 启动统计服务
totalService.start();


// Run
app.run();