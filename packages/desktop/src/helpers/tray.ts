import { Tray, Menu, BrowserWindow, ipcMain, App, nativeImage } from 'electron';
import path from 'path';
import { BenchesState } from '../redux/slices/benchesSlice';
import { UsersState } from '../redux/slices/usersSlice';
import { User, Bench } from 'common';
import SubscriptionCache from './subcache';

let tray: Tray | null = null;

let crownIcon: nativeImage | null = null;
let maintenanceIcon: nativeImage | null = null;

const userPosInLine = (user: User, bench: Bench) => {
  return bench.line.findIndex((it) => it === user.id);
};

const createBenchesPartOfMenu = (
  mainWindow: BrowserWindow,
  cache: SubscriptionCache
): Array<any> => {
  const { currentUser, all } = cache.usersState;
  if (!currentUser) return [];
  const isOwner = (id: number | null) => id != null && id === currentUser.id;
  const getNotOwnerTitle = (bench: Bench) => {
    const userPos = userPosInLine(currentUser, bench);
    const ownerName = all.find((it) => it.id === bench.owner)?.name;
    if (userPos === -1) {
      return ownerName;
    }
    return `${ownerName} - вы номер ${userPos} в очереди`;
  };
  const getOwnerTitle = (bench: Bench) =>
    isOwner(bench.owner)
      ? `Ваш бенч${bench.pending ? ` - в ожидании подтверждения` : ''}`
      : getNotOwnerTitle(bench);
  const getIcon = (bench: Bench) => {
    if (isOwner(bench.owner)) {
      return crownIcon;
    }
    if (bench.maintenance) {
      return maintenanceIcon;
    }
    return null;
  };
  return Object.values(cache.benchesState.benches).map((bench) => ({
    label: `${bench.name} - ${
      bench.owner != null ? getOwnerTitle(bench) : 'Свободно'
    }`,
    disabled: bench.maintenance,
    icon: getIcon(bench),
    click() {
      if (isOwner(bench.owner)) {
        if (bench.pending) {
          mainWindow.webContents.send(
            'tray-request-bench-message',
            bench.id,
            currentUser.id
          );
        } else {
          mainWindow.webContents.send(
            'tray-free-bench-message',
            bench.id,
            currentUser.id
          );
        }
      } else if (userPosInLine(currentUser, bench) !== -1) {
        mainWindow.webContents.send(
          'tray-free-bench-message',
          bench.id,
          currentUser.id
        );
      } else {
        mainWindow.webContents.send(
          'tray-request-bench-message',
          bench.id,
          currentUser.id
        );
      }
    },
  }));
};

const createUsersPartOfMenu = (cache: SubscriptionCache): Array<any> => {
  if (cache.usersState.currentUser == null) return [];
  return [
    {
      label: `Привет, ${cache.usersState.currentUser?.name}`,
    },
  ];
};

const recreateTrayMenu = (
  app: App,
  mainWindow: BrowserWindow,
  cache: SubscriptionCache
) => {
  return Menu.buildFromTemplate([
    ...createUsersPartOfMenu(cache),
    {
      type: 'separator',
    },
    {
      label: 'Развернуть Приложение',
      click() {
        mainWindow?.show();
      },
    },
    {
      type: 'separator',
    },
    {
      label: cache.internetAvailable
        ? 'Вы соединены с сервером'
        : 'Нет соединения с сервером',
      enabled: false,
    },
    {
      type: 'separator',
    },
    ...createBenchesPartOfMenu(mainWindow, cache),
    {
      type: 'separator',
    },
    {
      label: 'Выйти',
      click() {
        mainWindow.destroy();
        app.quit();
      },
    },
  ]);
};

export default (app: App, mainWindow: BrowserWindow) => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  const cache = new SubscriptionCache();

  try {
    (async () => {
      crownIcon = await nativeImage.createThumbnailFromPath(
        getAssetPath('Simple_gold_crown.png'),
        {
          height: 16,
          width: 16,
        }
      );
      maintenanceIcon = await nativeImage.createThumbnailFromPath(
        getAssetPath('maintenance.png'),
        {
          height: 16,
          width: 16,
        }
      );
    })();
    tray = new Tray(nativeImage.createFromPath(getAssetPath('icon.ico')));
    let contextMenu: Menu = recreateTrayMenu(app, mainWindow, cache);
    tray?.setToolTip('Gen12 Bench');
    tray?.setContextMenu(contextMenu);
    tray?.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
      }
    });
    cache.on('cache-updated', () => {
      contextMenu = recreateTrayMenu(app, mainWindow, cache);
      tray?.setContextMenu(contextMenu);
    });

    ipcMain.on('benches-update-message', (_, arg) => {
      cache.update({ benchesState: JSON.parse(arg) as BenchesState });
    });
    ipcMain.on('users-update-message', (_, arg) => {
      cache.update({ usersState: JSON.parse(arg) as UsersState });
    });
    ipcMain.on('internet-available', (_, arg) => {
      const internetAvailable = arg === 'true';
      if (!internetAvailable) {
        cache.reset();
      } else {
        cache.update({ internetAvailable });
      }
    });
  } catch (err) {
    console.error(err);
    mainWindow.destroy();
    app.quit();
  }

  return tray;
};
