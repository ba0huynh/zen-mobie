import { z } from "zod";
import { isDevelopment } from "./isDevelopment";

export function parseData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.infer<T> {
  if (isDevelopment()) return schema.parse(data);

  return data as z.infer<T>;
}
