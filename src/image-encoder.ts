import { encode } from "../deps.ts";

export class ImageEncoder {
  #cache = new Map<string, string>();

  async encodeImageToBase64(imageUrl: string) {
    const cached = this.#cache.get(imageUrl);
    if (cached != null) {
      return cached;
    }
    const blob = await fetch(imageUrl).then((r) => r.blob());
    const encoded = encode(await blob.arrayBuffer());
    this.#cache.set(imageUrl, encoded);
    return encoded;
  }
}
