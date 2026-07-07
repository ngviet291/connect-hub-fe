// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorMessage = (error: any, defaultMessage: string) => {
  return (
    error?.error ||
    error?.message ||
    error?.data?.error ||
    error?.response?.data?.error ||
    defaultMessage
  );
};