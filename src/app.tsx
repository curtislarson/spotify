/** @jsx jsx */
import { Hono, jsx, html } from "../deps.ts";
import { SpotifyAPI, SpotifyAPIOptions } from "./api.ts";
import { ImageEncoder } from "./image-encoder.ts";
import NowPlaying from "./NowPlaying.tsx";

const SVG = (body: unknown, width: number = 332, height: number = 380) => /** html */ html`
  <svg
    fill="none"
    width="${width}"
    height="${height}"
    viewbox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <foreignObject width="${width}" height="${height}">
      <style>
        img {
          width: 300px;
          height: 300px;
        }
        h1 {
          margin: 0;
          margin-top: 0.25rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #8aff80;
        }
        h2 {
          margin: 0;
          margin-top: 0.25rem;
          font-size: 1rem;
          font-weight: 400;
          color: #9850ff;
        }
        .container {
          width: fit-content;
          padding: 1rem;
          background-color: #22212c;
        }
      </style>
      ${body}
    </foreignObject>
  </svg>
`;

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
    this.get("/test", async (c) => {
      const recentlyPlayed = await this.api.getRecentlyPlayed();
      return c.json(recentlyPlayed);
    });
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
      return c.body(SVG(<NowPlaying {...renderData} />), 200, {
        "cache-control": "s-maxage=1, stale-while-revalidate",
        "content-type": "image/svg+xml",
      });
    });
  }

  async #getTrackData() {}
}
