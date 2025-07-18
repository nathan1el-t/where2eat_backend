import type { PopulateOptions } from 'mongoose';
import type { Request } from 'express';

export type GetOneOptions = {
  populateOptions?: PopulateOptions | (string | PopulateOptions)[];
  selectFields?: string;
  findByFn?: (req: Request) => Record<string, any>;
  enableVirtuals?: boolean;
};

export type DeleteOneOptions<T> = {
  postDeleteFn?: (doc: T) => Promise<void> | void;
};

