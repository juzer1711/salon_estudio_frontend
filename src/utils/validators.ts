export const isValidEmail = (
  value: string
): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
};

export const isValidPassword = (
  value: string
): boolean => {
  return value.trim().length >= 6;
};

export const isValidUsername = (
  value: string
): boolean => {
  return /^[a-zA-Z0-9_]+$/.test(
    value
  );
};

export const isEducationalEmail = (
  email: string
): boolean => {
  return email.trim().toLowerCase().endsWith(".edu.co");
};