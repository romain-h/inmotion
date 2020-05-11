import React, { ReactType } from 'react';
import { useStyletron } from 'baseui';
import { Block, BlockProps } from 'baseui/block';
import { Content } from 'components/ui/content';

export const SubMenu: React.FC<BlockProps> = ({ children, ...props }) => (
  <Block
    {...props}
    as="nav"
    overrides={{
      Block: {
        style: ({ $theme }) => ({
          display: 'flex',
          flexDirection: 'row',
          paddingLeft: $theme.sizing.scale400,
          paddingRight: $theme.sizing.scale400,
          boxShadow: `inset 0 -1px ${$theme.colors.border}`,
        }),
      },
    }}
  >
    <Content display="flex">{children}</Content>
  </Block>
);

type SubMenuItemProps = React.HTMLProps<HTMLElement> & {
  $as?: ReactType;
  $active?: boolean;
  $disabled?: boolean;
};

export const SubMenuItem = React.forwardRef<
  HTMLAnchorElement,
  SubMenuItemProps
>(({ $as: Tag = 'a', $active = false, $disabled = false, ...props }, ref) => {
  const [css, theme] = useStyletron();
  const { colors, typography, sizing } = theme;

  const base = {
    ...typography.font200,
    boxSizing: 'border-box',
    color: $active ? colors.contentPrimary : colors.tabColor,
    cursor: $disabled ? 'default' : 'pointer',
    paddingTop: sizing.scale400,
    paddingBottom: sizing.scale400,
    paddingLeft: sizing.scale300,
    paddingRight: sizing.scale300,
    marginLeft: sizing.scale200,
    marginRight: sizing.scale200,
    outline: 'none',
    outlineOffset: '-3px',
    textDecoration: 'none',
    ':first-of-type': {
      marginLeft: `-${sizing.scale300}`,
    },
    ':last-of-type': {
      marginRight: `-${sizing.scale300}`,
    },
    display: 'inline-block',
    position: 'relative',
    ':focus': {
      outline: 'none',
      outlineOffset: '1px',
      textDecoration: 'none',
    },
    ':hover': {
      color: $disabled ? colors.tabColor : colors.contentPrimary,
    },
    ':active': {
      color: colors.linkActive,
    },
  };

  const active = {
    '::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      height: 0,
      left: sizing.scale300,
      right: sizing.scale300,
      bottom: 0,
      borderBottom: '2px solid currentcolor',
    },
  };

  let style;
  if ($active) {
    style = { ...base, ...active };
  } else {
    style = base;
  }
  return (
    <Tag
      {...props}
      ref={ref}
      onClick={(e) => {
        if ($disabled) {
          e.preventDefault();
        } else if (props.onClick) {
          props.onClick(e);
        }
      }}
      className={css(style)}
    />
  );
});
