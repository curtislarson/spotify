import { getStyleTag, html, setup, tw, virtualSheet } from "../deps.ts";

const sheet = virtualSheet();

setup({
  theme: {
    colors: {
      background: {
        200: "#585572",
        500: "#22212c",
      },
      primary: "#8aff80",
      secondary: "#9850ff",
      orange: "#FFCA80",
    },
  },
  sheet,
});

export interface NowPlayingProps {
  name: string;
  artistNames: string[];
  imageUrl: string;
  isPlaying: boolean;
  progress?: number;
  duration?: number;
}

function msToTime(s: number) {
  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;

  return mins + ":" + secs;
}

function renderProgressBar({ progress, duration }: NowPlayingProps) {
  if (progress == null || duration == null) {
    return "";
  } else {
    const progressPercent = progress && duration
      ? Math.floor((progress / duration) * 100)
      : null;
    return html`
    <div class="${tw`flex flex-row`}">
      <div class="${tw`text-orange text-xs pr-1 mt-[5px]`}">${msToTime(progress)}</div>
      <div class="${tw`w-full mt-2 bg-background-200 rounded-full h-2.5`}">
        <div class="${tw`bg-primary h-2.5 rounded-full`}" style="width:${progressPercent}%"></div>
      </div>
      <div class="${tw`text-orange text-xs pl-1 mt-[5px]`}">${msToTime(duration)}</div>
    </div>
    `;
  }
}

export function renderNowPlayingCard(props: NowPlayingProps) {
  return html`
    <div class="${tw`w-fit p-2 bg-background-500`}" xmlns="http://www.w3.org/1999/xhtml">
      <img class="${tw`h-72 w-72`}" src="${props.imageUrl}"></img>
      <h1 class="${tw`m-0 mt-1 text-base font-medium text-primary overflow-x-clip`}">${props.name}</h1>
      <h2 class="${tw`m-0 text-sm font-normal text-secondary overflow-x-clip`}">${props.artistNames.join(", ")}</h2>
      ${renderProgressBar(props)}
    </div>
  `;
}

const SVG_WIDTH = 308;
const SVG_HEIGHT = 380;

export function render(props: NowPlayingProps) {
  sheet.reset();
  const body = renderNowPlayingCard(props);
  const styleTag = getStyleTag(sheet);
  return `<svg
    fill="none"
    width="${SVG_WIDTH}"
    height="${SVG_HEIGHT}"
    viewbox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <foreignObject width="${SVG_WIDTH}" height="${SVG_HEIGHT}">
      ${styleTag}
      ${body}
    </foreignObject>
  </svg>`;
}
