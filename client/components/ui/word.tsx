import React from 'react';
import { useStyletron } from 'baseui';

type WordProps = React.HTMLProps<HTMLSpanElement> & {
  $isCurrent: boolean;
};

export const Word = React.forwardRef<HTMLSpanElement, WordProps>(
  ({ $isCurrent, ...props }, ref) => {
    const [css, theme] = useStyletron();

    const c = css({
      backgroundColor: $isCurrent ? theme.colors.mono400 : null,
      '::selection': {
        // @ts-ignore How to add custom color alias to TS
        backgroundColor: theme.colors.textSelection,
        color: theme.colors.primary700,
      },
      ':hover': {
        backgroundColor: theme.colors.mono400,
      },
    });

    return <span ref={ref} className={c} {...props} />;
  },
);
