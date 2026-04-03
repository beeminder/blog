import { z } from "zod";

export const status = z.enum(["publish", "pending", "draft"]);
