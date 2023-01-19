#!/usr/bin/env -S deno run --allow-read --allow-env --allow-net --no-config --no-check

import { serve } from "./deps.ts";
import { SpotifyApp } from "./src/app.ts";
import "https://deno.land/std@0.172.0/dotenv/load.ts";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = Deno.env.toObject();

const app = new SpotifyApp({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  refreshToken: SPOTIFY_REFRESH_TOKEN,
});

serve(app.fetch);
