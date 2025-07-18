import { Group } from "../groupModel.js";

export const generateUniqueGroupCode = async (
  length: number = 6
): Promise<string> => {
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const generate = (): string => {
    let code = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * characters.length);
      code += characters[index];
    }
    return code;
  };

  let code: string;
  let exists = true;

  while (exists) {
    code = generate();

    const group = await Group.findOne({ code });
    if (!group) {
      exists = false;
    }
  }

  return code!;
};
