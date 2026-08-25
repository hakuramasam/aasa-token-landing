import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { ALLOWED_ARTWORK_TYPES, getNftDrafts, saveNftDraft } from "./nft";

const nftAttributesSchema = z.array(
  z.object({
    traitType: z.string().trim().min(1).max(48),
    value: z.string().trim().min(1).max(96),
  }),
).max(12);

const nftDraftInput = z.object({
  artworkDataUrl: z.string().max(14_000_000),
  artworkMimeType: z.enum(ALLOWED_ARTWORK_TYPES),
  artworkName: z.string().trim().min(1).max(255),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1_000).optional(),
  attributes: nftAttributesSchema,
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  nft: router({
    listDrafts: protectedProcedure.query(({ ctx }) => getNftDrafts(ctx.user.id)),
    saveDraft: protectedProcedure.input(nftDraftInput).mutation(async ({ ctx, input }) => {
      return saveNftDraft({ userId: ctx.user.id, ...input });
    }),
  }),
});

export type AppRouter = typeof appRouter;
