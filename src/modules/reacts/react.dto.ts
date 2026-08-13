import * as z from "zod";
import { createReactSchema } from "./react.validation";

export type  createReactDTO = z.infer<typeof createReactSchema.body>