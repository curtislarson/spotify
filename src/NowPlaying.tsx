/** @jsx jsx */
import { jsx } from "../deps.ts";

export interface NowPlayingProps {
  name: string;
  artistNames: string[];
  imageUrl: string;
  isPlaying: boolean;
  ts?: number;
  progress?: number;
}

export default function NowPlaying(props: NowPlayingProps) {
  return (
    <div class="container" xmlns="http://www.w3.org/1999/xhtml">
      <img src={props.imageUrl}></img>
      <h1>{props.name}</h1>
      <h2>{props.artistNames.join(", ")}</h2>
    </div>
  );
}
