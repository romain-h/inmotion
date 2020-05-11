import React, { ReactNode, useState } from 'react';
import { ChevronRight, ChevronDown } from 'baseui/icon';
import { useStyletron } from 'baseui';

type CaptionProps = {
  children: ReactNode;
};

const styleCollapsed = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

export const Caption: React.FC<CaptionProps> = ({ children }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [css, theme] = useStyletron();

  const base = {
    ...theme.typography.ParagraphMedium,
    textAlign: 'justify',
    fontStyle: 'italic',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      className={css({
        position: 'relative',
        cursor: 'default',
      })}
      onClick={() => {
        setExpanded(!expanded);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className={css({
            position: 'absolute',
            left: `-${theme.sizing.scale800}`,
            top: theme.sizing.scale0,
          })}
        >
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </div>
      )}
      <div className={css(expanded ? base : { ...base, ...styleCollapsed })}>
        {children}
      </div>
    </div>
  );
};
