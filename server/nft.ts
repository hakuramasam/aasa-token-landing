import { createNftDraft, listNftDraftsForUser } from "./db";
import { storagePut } from "./storage";

export const ALLOWED_ARTWORK_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
export type ArtworkMimeType = (typeof ALLOWED_ARTWORK_TYPES)[number];
export const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

const extensionByType: Record<ArtworkMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function parseArtworkDataUrl(dataUrl: string, mimeType: ArtworkMimeType): Buffer {
  const dataUrlMatch = dataUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!dataUrlMatch || dataUrlMatch[1] !== mimeType) {
    throw new Error("Artwork data does not match its declared image type");
  }

  const bytes = Buffer.from(dataUrlMatch[2].replace(/\s/g, ""), "base64");
  if (bytes.length === 0 || bytes.length > MAX_ARTWORK_BYTES) {
    throw new Error("Artwork must be an image no larger than 10 MB");
  }
  return bytes;
}

export async function saveNftDraft(input: {
  userId: number;
  artworkDataUrl: string;
  artworkMimeType: ArtworkMimeType;
  artworkName: string;
  title: string;
  description?: string | null;
  attributes: Array<{ traitType: string; value: string }>;
  walletAddress?: string | null;
}) {
  const bytes = parseArtworkDataUrl(input.artworkDataUrl, input.artworkMimeType);
  const extension = extensionByType[input.artworkMimeType];
  const { key, url } = await storagePut(
    `nft-drafts/${input.userId}/artwork.${extension}`,
    bytes,
    input.artworkMimeType,
  );

  await createNftDraft({
    userId: input.userId,
    artworkKey: key,
    artworkUrl: url,
    artworkName: input.artworkName,
    artworkMimeType: input.artworkMimeType,
    title: input.title,
    description: input.description || null,
    attributesJson: JSON.stringify(input.attributes),
    walletAddress: input.walletAddress || null,
    status: "mint_prepared",
  });

  return { artworkUrl: url, artworkKey: key };
}

export async function getNftDrafts(userId: number) {
  return listNftDraftsForUser(userId);
}
