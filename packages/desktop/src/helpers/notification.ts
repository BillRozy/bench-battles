import { mapValues, wrap } from 'lodash';
import { ipcRenderer } from 'electron';
import { ErrorType } from 'typescript-logging';
import icon from '../../assets/icon.png';
import { appLogger as logger } from '../log';

let isWindowVisible = false;

ipcRenderer.on('visibility-change', (_, visibility: boolean) => {
  isWindowVisible = visibility;
  logger.debug(`Main window is visible: ${isWindowVisible} now`);
});

const notifications = {
  BENCH_IS_FREE: async (benchName: string) => {
    const note = new Notification(`${benchName}`, {
      body: `Бенч ${benchName} теперь свободен!`,
      icon,
      requireInteraction: false,
    });
  },
  BENCH_WAS_TAKEN: async (benchName: string, userName: string) => {
    const note = new Notification(`${benchName}`, {
      body: `${userName} занял бенч ${benchName}!`,
      icon,
    });
  },
  BENCH_WAS_TAKEN_BY_YOU: async (benchName: string) => {
    const note = new Notification(`${benchName}`, {
      body: `Вы заняли бенч ${benchName}, поздравляем!`,
      icon,
    });
  },
  BENCH_CONFLICTS: async (ownedBenches: string[], inlinedBenches: string[]) => {
    const note = new Notification(`Конфликт Бенчей`, {
      body: `Вы заняли бенч, но при этом продолжаете владеть или состоять в очереди на другие бенчи.`,
      icon,
    });
  },
  BENCH_PENDING: async (benchName: string, pending: boolean) => {
    const note = new Notification(`Бенч ${benchName}`, {
      body: pending
        ? `Бенч ${benchName} в ожидании подтверждения со стороны тестера.`
        : `Бенч ${benchName} больше не в режиме ожидания.`,
      icon,
    });
  },
  BENCH_MAINTENANCE: async (benchName: string, pending: boolean) => {
    const note = new Notification(`Бенч ${benchName}`, {
      body: pending
        ? `Бенч ${benchName} в состоянии обслуживания.`
        : `Бенч ${benchName} больше не в состоянии обслуживания.`,
      icon,
    });
  },
};

export default mapValues(notifications, (func: CallableFunction) =>
  wrap(func, async (originalFunc: CallableFunction, ...rest: any[]) => {
    try {
      await Notification.requestPermission();
      if (isWindowVisible) {
        logger.debug('Notification was not shown because main window is open');
        return;
      }
      await originalFunc(...rest);
    } catch (err) {
      logger.error((err as Error).message, err as ErrorType);
      await Promise.reject();
    }
  })
);
