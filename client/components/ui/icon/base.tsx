import React from 'react';
import { Icon, IconProps } from 'baseui/icon';

export type BaseProps = IconProps & {
  paddingLeft?: string;
};
export const Base: React.FC<BaseProps> = ({ paddingLeft, ...props }) => (
  <Icon
    {...props}
    overrides={{
      Svg: {
        props: {
          viewBox: '0 0 24 24',
        },
        style: ({ $theme, $color }) => {
          const color = $color && $theme.colors[$color];
          return {
            fill: 'none',
            stroke: color ? color : $color,
            strokeWidth: '2',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            paddingLeft: $theme.sizing[paddingLeft],
          };
        },
      },
    }}
  />
);
