import { WithID } from 'common';
export interface IModel<T = WithID, V = WithID> extends WithID {
    getId () : number;
    toJSON() : V;
    update(rawData: T) : IModel<T, V>;
    stopAllActions() : void;
}