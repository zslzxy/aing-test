import { logger } from 'ee-core/log';
import { getConfig } from 'ee-core/config';
import { getMainWindow } from 'ee-core/electron';
import { pub } from '../class/public';
import { ContextMenu } from '../class/menu';

let WindowSize = {size:0, position:0};

class Lifecycle {
  /**
   * Core app has been loaded
   */
  async ready(): Promise<void> {
    logger.info('[lifecycle] ready');
  }

  /**
   * Electron app is ready
   */
  async electronAppReady(): Promise<void> {
    logger.info('[lifecycle] electron-app-ready');
  }

  /**
   * Main window has been loaded
   */
  async windowReady(): Promise<void> {
    logger.info('[lifecycle] window-ready');
    // Delay loading, no white screen


    const win = getMainWindow();
    win.setMenu(null);
    let window = pub.C('window');
    if (window && window.size) {
      win.setSize(window.size[0], window.size[1]);
    }
    if (window && window.position) {
      win.setPosition(window.position[0], window.position[1]);
    }

    const config = getConfig();
    const { windowsOption } = config;
    if (windowsOption?.show === false) {
      win.once('ready-to-show', () => {
        win.show();
        win.focus();
      });
    }


    // 当调整窗口大小时，记录窗口大小
    win.on('resize', () => {
      // 全屏和最大化、最小化时不记录窗口大小
      if (win.isFullScreen() || win.isMaximized() || win.isMinimized()) return;


      WindowSize.size = win.getSize();
      WindowSize.position = win.getPosition();
      
    });


  
    // 加载菜单
    win.webContents.on("context-menu", (event:any, params:any) => {
      let menu_obj = new ContextMenu(event, params);
      let contextMenu = menu_obj.get_context_menu();
      if (contextMenu) contextMenu.popup({ window: win });
    });


    
  }

  /**
   * Before app close
   */
  async beforeClose(): Promise<void> {
    logger.info('[lifecycle] before-close');

    // 保存窗口大小
    pub.C('window', WindowSize);
  }
}
Lifecycle.toString = () => '[class Lifecycle]';

export { Lifecycle };