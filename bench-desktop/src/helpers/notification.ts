import { mapValues, wrap } from 'lodash';
import icon from '../../assets/icon.png';

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
};

export default mapValues(notifications, (func: CallableFunction) =>
  wrap(func, async (originalFunc: CallableFunction, ...rest: any[]) => {
    try {
      await Notification.requestPermission();
      return originalFunc(...rest);
    } catch (err) {
      console.error(err);
      return Promise.reject();
    }
  })
);
