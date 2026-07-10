// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getErrorMessage = (error: any, defaultMessage: string) => {
  return (
    error?.message ||
    error?.error ||
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.data?.error ||
    error?.response?.data?.error ||
    defaultMessage
  );
};