export const isEmail = (email: string): boolean => {
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return email !== '' && strictEmailRegex.test(email);
};


