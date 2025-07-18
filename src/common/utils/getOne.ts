import { catchAsync } from './catchAsync.js';
import { StatusCodes } from 'http-status-codes';
import type { Model } from 'mongoose';
import type { RequestHandler } from 'express';
import { AppError } from './AppError.js';
import { GetOneOptions, DeleteOneOptions } from '../../types/factory.js';

export const getOne = <T>(
  Model: Model<T>,
  options?: GetOneOptions
): RequestHandler => {
  const {
    populateOptions,
    selectFields,
    findByFn,
    enableVirtuals = true,
  } = options || {};
  return catchAsync(async (req, res, next) => {
    let query;
    if (findByFn) {
      const filter = findByFn(req);
      query = Model.findOne(filter);
    } else {
      query = Model.findById(req.params.id);
    }

    if (populateOptions) query = query.populate(populateOptions);
    if (selectFields) query = query.select(selectFields);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No ${Model.modelName} found`, StatusCodes.NOT_FOUND)
      );
    }

    let output = doc.toJSON({ virtuals: enableVirtuals });

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { [Model.modelName.toLowerCase()]: output },
    });
  });
};

