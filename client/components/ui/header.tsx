import React, { ReactNode } from 'react';
import { useStyletron } from 'baseui';

type HeaderProps = {
  $hasSubmenu?: boolean;
  children: ReactNode;
};

export const Header: React.FC<HeaderProps> = ({
  $hasSubmenu = false,
  children,
}) => {
  const [css, theme] = useStyletron();

  const c = css({
    paddingTop: theme.sizing.scale500,
    paddingBottom: theme.sizing.scale500,
    boxShadow: $hasSubmenu ? null : `inset 0 -1px ${theme.colors.border}`,
  });

  return (
    <header className={c} role="navigation">
      {children}
    </header>
  );
};
