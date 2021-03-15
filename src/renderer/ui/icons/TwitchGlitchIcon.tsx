import React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

export interface TwitchGlitchIconProps extends SvgIconProps {
  variant?: "outlined" | "black-ops" | "purple";
}

export const TwitchGlitchIcon = ({
  // TwitchGlitchIconProps
  variant = "outlined",

  // SvgIconProps
  ...props
}: TwitchGlitchIconProps) => {
  const fillClassName =
    variant === "purple" ? "st1" : variant === "black-ops" ? "st2" : undefined;
  return (
    <SvgIcon {...props} viewBox="0 0 2400 2800">
      <style type="text/css">
        {`.st0 { fill: #FFFFFF; }`}
        {`.st1 { fill: #9146ff; }`}
        {`.st2 { fill: #000000; }`}
      </style>
      <g>
        {variant !== "outlined" && (
          <polygon
            className="st0"
            points="2200,1300 1800,1700 1400,1700 1050,2050 1050,1700 600,1700 600,200 2200,200"
          />
        )}
        <g>
          <g id="Layer_1-2">
            <path
              className={fillClassName}
              d="M500,0L0,500v1800h600v500l500-500h400l900-900V0H500z M2200,1300l-400,400h-400l-350,350v-350H600V200h1600V1300z"
            />
            <rect
              x="1700"
              y="550"
              className={fillClassName}
              width="200"
              height="600"
            />
            <rect
              x="1150"
              y="550"
              className={fillClassName}
              width="200"
              height="600"
            />
          </g>
        </g>
      </g>
    </SvgIcon>
  );
};
