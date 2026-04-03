import { z } from "zod";

export const dateString = z
  .date()
  .transform((date) => date.toISOString().split("T")[0])
  .refine((s): s is string => s?.length === 10, {
    error: "Invalid date input",
  });
