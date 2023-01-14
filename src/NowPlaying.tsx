/** @jsx jsx */
import { jsx } from "../deps.ts";

export interface NowPlayingProps {
  name: string;
  artistNames: string[];
  imageUrl: string;
  ts: number;
  progress: number;
  duration: number;
}

export default function NowPlaying(props: NowPlayingProps) {
  return (
    <div class="container">
      <img src={props.imageUrl}></img>
      <h1>{props.name}</h1>
      <h2>{props.artistNames.join(", ")}</h2>
    </div>
  );
}
