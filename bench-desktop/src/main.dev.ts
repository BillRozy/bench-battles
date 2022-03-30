/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, session } from 'electron';
import registerTrayToMainWindow from './helpers/tray';
import MenuBuilder from './menu';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const PATH_TO_EXTS =
    'C:/Users/Professional/AppData/Local/Google/Chrome/User Data/Default/Extensions';
  const REACT_DEV_TOOLS = 'fmkadmapgofadopljbjfkapdkoienihi/4.18.0_0';
  const REDUX_DEV_TOOLS = 'lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.2_0';
  const extensions = [REACT_DEV_TOOLS, REDUX_DEV_TOOLS];

  try {
    extensions.forEach(async (ext) => {
      await session.defaultSession.loadExtension(path.join(PATH_TO_EXTS, ext), {
        allowFileAccess: true,
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 800,
    minHeight: 600,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true,
    },
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  app.applicationMenu = menuBuilder.buildMenu();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
      mainWindow.show();
      // mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('focus', () => {
    mainWindow?.webContents.send('visibility-change', true);
  });
  mainWindow.on('blur', () => {
    mainWindow?.webContents.send('visibility-change', false);
  });

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  const tray = registerTrayToMainWindow(app, mainWindow);
};

/**
 * Add event listeners...
 */

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  (async () => {
    await app.whenReady();
    try {
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
      ) {
        await installExtensions();
      }
      setTimeout(createWindow, 1000);
    } catch (err) {
      console.log(err);
    }
  })();
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  app.releaseSingleInstanceLock();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
