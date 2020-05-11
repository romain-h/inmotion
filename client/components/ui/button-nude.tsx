import React from 'react';
import { Button, ButtonProps } from 'baseui/button';

export const ButtonNude = React.forwardRef<Button, ButtonProps>(
  (props, ref) => (
    <Button
      ref={ref}
      overrides={{
        BaseButton: {
          style: {
            backgroundColor: 'none',
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      }}
      {...props}
    />
  ),
);
