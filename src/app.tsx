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
          color: #9850ff;
        }
        h2 {
          margin: 0;
          margin-top: 0.25rem;
          font-size: 1rem;
          font-weight: 400;
          color: #8aff80;
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
    this.get("/", async (c) => {
      const currentlyPlaying = await this.api.getCurrentlyPlaying();
      if (!currentlyPlaying.isPlaying) {
        return c.json({ isPlaying: false });
      } else {
        const { item } = currentlyPlaying.data;
        const imageUrl =
          item.album.images.sort((a, b) => b.height - a.height).at(0)?.url ?? SpotifyApp.PLACEHOLDER_IMAGE;
        const encodedImageUrl = await this.encoder.encodeImageToBase64(imageUrl);

        const renderData = {
          name: item.name,
          artistNames: item.artists.map((a) => a.name),
          imageUrl: `data:image/png;base64,${encodedImageUrl}`,
          ts: currentlyPlaying.data.timestamp,
          progress: currentlyPlaying.data.progress_ms,
          duration: item.duration_ms,
        };
        return c.body(SVG(<NowPlaying {...renderData} />), 200, { "content-type": "image/svg+xml" });
      }
    });
  }
}
