import { Schema } from 'mongoose';

export const getRequiredFields = <T extends Record<string, any>>(
  schema: Schema,
  body: T
): Partial<T> => {
  const requiredFields = schema.requiredPaths();

  const formattedBody: Partial<T> = {};

  requiredFields.forEach((field) => {
    if (body[field] !== undefined) {
      formattedBody[field as keyof T] = body[field];
    }
  });

  return formattedBody;
};
