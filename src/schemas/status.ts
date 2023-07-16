import { z } from "zod";

export const status = z.enum(["publish", "pending", "draft"]);

export type Status = z.infer<typeof status>;
