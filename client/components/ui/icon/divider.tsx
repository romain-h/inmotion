import React from 'react';
import { Icon, IconProps } from 'baseui/icon';

export const Divider: React.FC<IconProps> = (props) => (
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
            strokeWidth: '1',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          };
        },
      },
    }}
    title="divider"
  >
    <line x1="15.4472" y1="5.22361" x2="9.44721" y2="17.2236" />
  </Icon>
);
