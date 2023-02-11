import { debug } from "../deps.ts";
import { CurrentlyPlayingResponse, RecentlyPlayedResponse, SavedTracksResponse } from "./types.ts";

export interface SpotifyAPIOptions {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
}

const log = debug("SpotifyAPI");

export class SpotifyAPI {
  readonly clientId;
  readonly clientSecret;
  readonly refreshToken;
  accessToken?: string;
  expiresIn?: Date;

  constructor(options: SpotifyAPIOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.refreshToken = options.refreshToken;
  }

  async getCurrentlyPlaying() {
    const endpoint = "https://api.spotify.com/v1/me/player/currently-playing";
    const accessToken = await this.getAccessToken();

    const resp = await fetch(endpoint, this.#getRequestInit(accessToken)).then(async (r) => {
      // No content, aka not currently playing anything
      if (r.status === 204) {
        return {
          isPlaying: false as const,
        };
      }
      if (!r.ok || r.body == null) {
        throw new Error(`${r.statusText}: ${r.status}`);
      }
      return {
        isPlaying: true as const,
        data: await r.json() as CurrentlyPlayingResponse,
      };
    });

    return resp;
  }

  async getRecentlyPlayed() {
    const endpoint = "https://api.spotify.com/v1/me/player/recently-played";
    const accessToken = await this.getAccessToken();
    const resp = await fetch(endpoint, this.#getRequestInit(accessToken)).then(async (r) => {
      if (!r.ok || r.body == null) {
        throw new Error(`${r.statusText}: ${r.status}`);
      }
      return await r.json() as RecentlyPlayedResponse;
    });

    return resp;
  }

  async getSavedTracks(offset?: number) {
    let endpoint = "https://api.spotify.com/v1/me/tracks?limit=50";
    if (offset) {
      endpoint += `&offset=${offset}`;
    }
    const accessToken = await this.getAccessToken();
    log(`Querying endpoint ${endpoint}`);
    const resp = await fetch(endpoint, this.#getRequestInit(accessToken)).then(async (r) => {
      if (!r.ok || r.body == null) {
        throw new Error(`${r.statusText}: ${r.status}`);
      }
      return await r.json() as SavedTracksResponse;
    });

    return resp;
  }

  async getTopTracks() {
    const endpoint = "https://api.spotify.com/v1/me/top/tracks";
    const accessToken = await this.getAccessToken();
    const resp = await fetch(endpoint, this.#getRequestInit(accessToken)).then(async (r) => {
      if (!r.ok || r.body == null) {
        throw new Error(`${r.statusText}: ${r.status}`);
      }
      return await r.json();
    });

    return resp;
  }

  async getAccessToken() {
    if (this.accessToken == null || this.#hasExpired()) {
      const res: { access_token?: string } = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
        },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: this.refreshToken }),
      }).then((r) => r.json());

      if (res.access_token != null) {
        this.accessToken = res.access_token;
        const expiresIn = new Date();
        // It's 3600 but give some buffer
        expiresIn.setMilliseconds(expiresIn.getMilliseconds() + 3500);
        this.expiresIn = expiresIn;
        return this.accessToken;
      } else {
        throw new Error("Could not retrieve access_token");
      }
    } else {
      return this.accessToken;
    }
  }

  #getRequestInit(accessToken: string): RequestInit {
    return {
      headers: [
        ["Accept", "application/json"],
        ["Content-Type", "application/json"],
        ["Authorization", `Bearer ${accessToken}`],
      ],
    };
  }

  #hasExpired() {
    return this.accessToken != null && this.expiresIn != null && this.expiresIn <= new Date();
  }
}
