export enum DialogType {
  BENCH_CONFLICT_ALERT,
  BENCH_CONFIRM_ALERT,
}

export enum ForUserType {
  ALL,
  CURRENT,
}

export type DialogAction = {
  name: string;
  onClick: () => void;
};

export type DialogInfo = {
  type: DialogType;
  title: string;
  message: string;
  actions: DialogAction[];
  forUser: ForUserType;
};
