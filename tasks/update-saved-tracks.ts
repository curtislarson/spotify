#!/usr/bin/env -S deno run -A --unstable --no-check --no-config

import { load } from "https://deno.land/std@0.177.0/dotenv/mod.ts";
import { SpotifyAPI } from "../src/api.ts";
import { getSavedTracks, normalizeToSavedTrack } from "../src/saved-tracks.ts";

const SAVED_TRACKS_FILE_URL = new URL("../data/saved-tracks.json", import.meta.url);

function writeOutputIfCi(newTracksCount: number) {
  if (Deno.env.get("CI")) {
    const GITHUB_OUTPUT = Deno.env.get("GITHUB_OUTPUT")!;
    Deno.writeTextFileSync(GITHUB_OUTPUT, `NEW_TRACKS_COUNT=${newTracksCount}`, { append: true });
  }
}

async function updateSavedTracks() {
  if (!Deno.env.get("CI")) {
    await load({ envPath: new URL("../.env", import.meta.url).pathname, export: true });
  }

  const savedTracksData = getSavedTracks();
  const initialSavedTracksLength = savedTracksData.size;
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = Deno.env.toObject();
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error(`SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN are required`);
  }

  const api = new SpotifyAPI({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    refreshToken: SPOTIFY_REFRESH_TOKEN,
  });

  let offset = 0;
  let foundExisting = false;
  while (!foundExisting) {
    const newTracks = await api.getSavedTracks(offset);
    newTracks.forEach(({ track, added_at }) => {
      if (savedTracksData.has(track.id)) {
        foundExisting = true;
      } else {
        savedTracksData.set(track.id, normalizeToSavedTrack(track, added_at));
      }
    });
    if (newTracks.length < 50) {
      break;
    }
    offset += 50;
  }
  const numNewTracks = savedTracksData.size - initialSavedTracksLength;
  console.log(`Loaded ${numNewTracks} New Tracks`);

  if (numNewTracks > 0) {
    Deno.writeTextFileSync(
      SAVED_TRACKS_FILE_URL,
      JSON.stringify(
        [...savedTracksData.values()].sort((a, b) => new Date(a.added_at) < new Date(b.added_at) ? 1 : -1),
        null,
        2,
      ),
    );
    writeOutputIfCi(numNewTracks);
  }
}

updateSavedTracks().catch(console.error);
