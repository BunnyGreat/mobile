export const generateReferenceNumber = (): string => {
  const prefix = "REQ";
  const randomPart = Math.floor(Math.random() * 900000 + 100000).toString();
  const timestamp = Date.now().toString().slice(-5);
  return `${prefix}-${timestamp}-${randomPart}`;
};
