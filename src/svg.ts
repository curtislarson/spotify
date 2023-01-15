import { html } from "../deps.ts";
export const renderSVG = (body: unknown, width: number = 332, height: number = 380) =>
  /** html */ html`
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
