import SavedTracks from "../data/saved-tracks.json" assert { type: "json" };
import { Track } from "./types.ts";

export interface SavedTrack {
  added_at: string;
  album: Album;
  artists: Artist[];
  duration_ms: number;
  explicit: boolean;
  href: string;
  id: string;
  name: string;
  popularity: number;
  track_number: number;
  type: string;
  uri: string;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface Artist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

export function getSavedTracks(): Map<string, SavedTrack> {
  return new Map(SavedTracks.map((s) => [s.id, s]));
}

export function normalizeToSavedTrack(
  { album, artists, duration_ms, explicit, href, id, name, popularity, track_number, type, uri }: Track,
  added_at: string,
): SavedTrack {
  return {
    added_at,
    album: { ...album, available_markets: undefined },
    artists,
    duration_ms,
    explicit,
    href,
    id,
    name,
    popularity,
    track_number,
    type,
    uri,
  };
}
