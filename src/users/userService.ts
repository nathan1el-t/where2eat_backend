import { StatusCodes } from 'http-status-codes';
import { User, UserDoc } from './userModel.js';
import { AppError } from '../common/utils/AppError.js';
import { UpdatePreferencesInput } from '../shared/schemas/UpdatePreferencesSchema.js';
import { UpdateUserProfileInput } from '../shared/schemas/UpdateUserProfileSchema.js';

export const updateUserPreferences = async (
  userId: string,
  newPreferences: UpdatePreferencesInput
): Promise<UserDoc> => {
  const updateOptions: Record<string, number> = {};

  newPreferences.forEach(({ cuisine, points }) => {
    updateOptions[`preferences.${cuisine}`] = Number(points);
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateOptions },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  return updatedUser;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateUserProfileInput
): Promise<UserDoc> => {
  if (data.username) {
    const existingUser = await User.findOne({
      username: data.username,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new AppError('Username already taken', StatusCodes.BAD_REQUEST);
    }
  }

  if (data.email) {
    const existingUser = await User.findOne({
      email: data.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new AppError('Email already taken', StatusCodes.BAD_REQUEST);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  return updatedUser;
};
