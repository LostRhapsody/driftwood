// response.ts
export type DriftResponse<T = Record<string, unknown>> = {
  result: boolean;
  status: number;
  message: string;
  body: T
};

export type toastData = {
  title: string;
  name: string;
};

/**
 * Accepts and parses the response
 * @param response the response from the backend
 * @returns true if operation was successful
 */
export function processResponse(response: DriftResponse<unknown>) {
  if (response.result) {
    console.log(`Operation successful: ${response.status} ${response.message}`);
  } else {
    console.log(`Operation failed: ${response.status} ${response.message}`);
  }
  return response.result;
}