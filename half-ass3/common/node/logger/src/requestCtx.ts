import { nanoid } from 'nanoid';

export interface IRequestCtx {
  readonly cId: string;
  readonly now: Date;
}

let reqCtx: IRequestCtx;

const requestCtx = () => {
  if (reqCtx === undefined) {
    reqCtx = {
      cId: nanoid(),
      now: new Date()
    };
  }
  return reqCtx;
};
export default requestCtx;

export const newRequestCtx = (existingCorrelationId?: string): IRequestCtx => {
  reqCtx = {
    cId: existingCorrelationId || nanoid(),
    now: new Date()
  };
  return reqCtx;
};
