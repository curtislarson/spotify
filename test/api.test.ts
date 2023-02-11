import { load } from "https://deno.land/std@0.177.0/dotenv/mod.ts";
import { SpotifyAPI } from "../src/api.ts";

await load({ envPath: new URL("../.env", import.meta.url).pathname, export: true });

Deno.test("api getTopTracks", async (t) => {
  await t.step("getTopTracks", async () => {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = Deno.env.toObject();

    const api = new SpotifyAPI({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      refreshToken: SPOTIFY_REFRESH_TOKEN,
    });

    await api.getTopTracks();
  });
});
