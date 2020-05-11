import React from 'react';
import { useStyletron } from 'baseui';

type LinkProps = React.HTMLProps<HTMLAnchorElement>;

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, ...props }, ref) => {
    const [css, theme] = useStyletron();
    const { colors, typography, animation } = theme;

    const c = css({
      color: colors.primary500,
      ...typography.font300,
      lineHeight: 'inherit',
      textDecoration: 'none',
      transitionProperty: 'color',
      transitionDuration: animation.timing200,
      transitionTimingFunction: animation.easeOutCurve,
      ':focus': {
        outline: 'none',
        outlineOffset: '1px',
        textDecoration: 'none',
      },
      ':visited': {
        color: colors.primary500,
      },
      ':hover': {
        color: colors.primary,
      },
      ':active': {
        color: colors.primary,
      },
    });

    return (
      <a ref={ref} {...props} className={c}>
        {children}
      </a>
    );
  },
);
