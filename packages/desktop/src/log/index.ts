import {
  Category,
  CategoryServiceFactory,
  CategoryConfiguration,
  LogLevel,
} from 'typescript-logging';

CategoryServiceFactory.setDefaultConfiguration(
  new CategoryConfiguration(LogLevel.Debug)
);

export const appLogger = new Category('App');
export const reduxLogger = new Category('Store', appLogger);
