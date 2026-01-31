/* eslint-disable @typescript-eslint/no-explicit-any */
export function objectToFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}
