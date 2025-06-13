import { ImageResponse } from "next/og";
import type { ReactElement, ReactNode } from "react";
import type { ImageResponseOptions } from "next/dist/compiled/@vercel/og/types";
import { siteConfig } from "~/site-config";

interface GenerateProps {
  title: ReactNode;
  tag: string;
  description?: ReactNode;
  primaryTextColor?: string;
}

export function generateOGImage(
  options: GenerateProps & ImageResponseOptions,
): ImageResponse {
  const { title, tag, description, primaryTextColor, ...rest } = options;

  return new ImageResponse(
    generate({
      title,
      tag,
      description,
      primaryTextColor,
    }),
    {
      width: 1200,
      height: 630,
      ...rest,
    },
  );
}

export function generate({
  primaryTextColor = "rgb(255,150,255)",
  ...props
}: GenerateProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        color: "white",
        background: "linear-gradient(135deg, #1da1f2 0%,rgb(22, 75, 220) 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "4rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "24px",
            marginBottom: "auto",
            color: primaryTextColor,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            viewBox="0 0 248 204"
            style={{
              width: "48px",
              height: "40px",
            }}
          >
            <path
              fill="white"
              d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
            />
          </svg>
          <p
            style={{
              fontSize: "54px",
              fontWeight: 600,
            }}
          >
            {siteConfig.name}
          </p>
        </div>
        <p
          style={{
            fontWeight: 600,
            fontSize: "26px",
          }}
        >
          @{props.tag}
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: "56px",
          }}
        >
          {props.title}
        </p>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(240,240,240,0.7)",
          }}
        >
          {props.description}
        </p>
      </div>
    </div>
  );
}
