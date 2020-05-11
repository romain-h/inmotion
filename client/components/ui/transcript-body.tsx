import React, { ReactNode, useState } from 'react';
import { useStyletron } from 'baseui';

type TranscriptBodyProps = {
  $hasSubmenu?: boolean;
  children: ReactNode;
};

export const TranscriptBody: React.FC<TranscriptBodyProps> = ({
  $hasSubmenu = false,
  children,
}) => {
  const [css, theme] = useStyletron();
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const c = css({
    ...theme.typography.ParagraphMedium,
    textAlign: 'justify',
    marginBottom: theme.sizing.scale600,
    color: theme.colors.contentPrimary,
    cursor: isHovered ? 'text' : 'pointer',
  });

  return (
    <div
      className={c}
      onMouseDown={() => setIsHovered(true)}
      onMouseUp={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};
