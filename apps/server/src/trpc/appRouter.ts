import "dotenv/config";
import { protectedProcedure, router } from "../utils/trpc/trpc.js";

export const appRouter = router({
  logout: protectedProcedure.mutation(async (opts) => {}),
});
