import { Hono } from "../deps.ts";
import { SpotifyAPI, SpotifyAPIOptions } from "./api.ts";
import { ImageEncoder } from "./image-encoder.ts";
import { render } from "./now-playing.ts";

export interface SpotifyAppOptions extends SpotifyAPIOptions {}

export interface TrackData {
  name: string;
  artistNames: string[];
  imageUrl: string;
  isPlaying: boolean;
  ts?: number;
  progress?: number;
}

export class SpotifyApp extends Hono {
  static PLACEHOLDER_IMAGE = "https://t.scdn.co/images/3099b3803ad9496896c43f22fe9be8c4.png";

  readonly api;
  readonly encoder;

  constructor(options: SpotifyAppOptions) {
    super();

    this.api = new SpotifyAPI(options);
    this.encoder = new ImageEncoder();

    this.#registerHandlers();

    this.showRoutes();
  }

  #registerHandlers() {
    this.get("*", async (c) => {
      let trackData: TrackData;
      const currentlyPlaying = await this.api.getCurrentlyPlaying();
      if (currentlyPlaying.isPlaying) {
        const { item } = currentlyPlaying.data;
        trackData = {
          name: item.name,
          artistNames: item.artists.map((a) => a.name),
          imageUrl: item.album.images.sort((a, b) => b.height - a.height).at(0)?.url ?? SpotifyApp.PLACEHOLDER_IMAGE,
          ts: currentlyPlaying.data.timestamp,
          progress: currentlyPlaying.data.progress_ms,
          duration: item.duration_ms,
          isPlaying: true,
        };
      } else {
        const recentlyPlayed = await this.api.getRecentlyPlayed();
        const item = recentlyPlayed.items[0].track;
        trackData = {
          name: item.name,
          artistNames: item.artists.map((a) => a.name),
          imageUrl: item.album.images.sort((a, b) => b.height - a.height).at(0)?.url ?? SpotifyApp.PLACEHOLDER_IMAGE,
          isPlaying: false,
        };
      }

      const encodedImageUrl = await this.encoder.encodeImageToBase64(trackData.imageUrl);

      const renderData = {
        ...trackData,
        imageUrl: `data:image/png;base64,${encodedImageUrl}`,
      };
      return c.body(render(renderData), 200, {
        "cache-control": "s-maxage=1, stale-while-revalidate",
        "content-type": "image/svg+xml",
      });
    });
  }
}
