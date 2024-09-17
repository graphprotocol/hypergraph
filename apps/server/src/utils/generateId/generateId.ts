const { randomBytes } = await import("node:crypto");

export const generateId = (length = 32) => {
  return randomBytes(length).toString("base64url");
};
