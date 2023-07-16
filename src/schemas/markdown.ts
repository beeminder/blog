import { z } from "zod";
import fetchPost from "../lib/fetchPost";

export const markdown = z
  .string()
  .transform((url) => url.replace("dtherpad.com", "padm.us"))
  .transform((url) => (url.startsWith("http") ? url : `https://${url}`))
  .transform(fetchPost);

export type Markdown = z.infer<typeof markdown>;
