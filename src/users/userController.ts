import { StatusCodes } from 'http-status-codes';
import type { RequestHandler } from 'express';
import { updateUserPreferences, updateUserProfile } from './userService.js';
import { User } from './userModel.js';
import { AppError } from '../common/utils/AppError.js';
import { catchAsync } from '../common/utils/catchAsync.js';
import { getOne } from '../common/utils/getOne.js';
import { Group } from '../groups/groupModel.js';
import { UpdatePreferencesSchema } from '../shared/schemas/UpdatePreferencesSchema.js';
import { UpdateUserProfileSchema } from '../shared/schemas/UpdateUserProfileSchema.js';

export const getMe: RequestHandler = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }
  req.params.id = req.user.id;
  next();
};

export const getUser = getOne(User);

// export const getUserHistory = getOne(User, {
//   populateOptions: { path: 'history' },
//   selectFields: 'history',
//   enableVirtuals: false,
// });

export const getUserGroups = getOne(User, {
  populateOptions: { path: 'groups' },
  selectFields: 'groups',
  enableVirtuals: true,
});

export const getUserPreferences = getOne(User, {
  selectFields: 'preferences',
  enableVirtuals: false,
});

export const getUserByUsername = getOne(User, {
  selectFields: 'username firstName lastName',
  findByFn: (req) => ({ username: req.params.username }),
  enableVirtuals: true,
});

export const updateUser = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const parsed = UpdateUserProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return next(
      new AppError(
        'Validation failed',
        StatusCodes.BAD_REQUEST,
        parsed.error.flatten().fieldErrors
      )
    );
  }

  const updatedUser = await updateUserProfile(req.user.id, parsed.data);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const updateMyPreferences = catchAsync(async (req, res, next) => {
  const parsed = UpdatePreferencesSchema.safeParse(req.body);

  if (!parsed.success) {
    return next(
      new AppError(
        'Validation failed',
        StatusCodes.BAD_REQUEST,
        parsed.error.flatten().fieldErrors
      )
    );
  }

  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const updatedUser = await updateUserPreferences(req.user.id, parsed.data);

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      user: {
        id: updatedUser.id,
        preferences: updatedUser.preferences,
      },
    },
  });
});
