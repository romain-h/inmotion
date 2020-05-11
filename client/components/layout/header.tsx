import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList,
} from 'baseui/header-navigation';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import { Content } from 'components/ui/content';
import { Header as H } from 'components/ui/header';
import { Link as StyledLink } from 'components/ui/link';
import { useAuth } from 'lib/hooks/auth';
import UserMenu from './user-menu';

type HeaderProps = {
  $hasSubmenu?: boolean;
  renderTitle?: () => ReactNode;
  children?: ReactNode;
};

const Header: React.FC<HeaderProps> = ({
  $hasSubmenu = false,
  renderTitle,
  children,
}) => {
  const { pathname, query } = useRouter();
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
  } = useAuth();

  return (
    <H $hasSubmenu={$hasSubmenu}>
      <Content display="flex">
        <Link href="/" passHref>
          <Block display="flex">
            <Block
              as="img"
              src="/logo.svg"
              width="40px"
              overrides={{
                Block: {
                  style: {
                    cursor: 'pointer',
                  },
                },
              }}
            />
            {renderTitle ? null : (
              <Block
                as="img"
                src="/logo-name.svg"
                width="90px"
                overrides={{
                  Block: {
                    style: {
                      cursor: 'pointer',
                      marginTop: '4px',
                      marginLeft: '16px',
                    },
                  },
                }}
              />
            )}
          </Block>
        </Link>
        {isAuthenticated && !renderTitle && (
          <Block paddingLeft="scale800" alignSelf="center">
            <Link href="/projects" passHref>
              <StyledLink>My Projects</StyledLink>
            </Link>
          </Block>
        )}
        {renderTitle && renderTitle()}
        <NavigationList $align={ALIGN.center} />
        <NavigationList $align={ALIGN.right}>
          <NavigationItem>
            {!isAuthenticated ? (
              <Button
                onClick={() =>
                  loginWithRedirect({
                    appState: { returnTo: { pathname, query } },
                  })
                }
                isLoading={isLoading}
              >
                Login
              </Button>
            ) : (
              user && (
                <UserMenu
                  user={user}
                  logout={() =>
                    logout({ returnTo: 'https://' + process.env.APP_HOST })
                  }
                />
              )
            )}
          </NavigationItem>
        </NavigationList>
      </Content>
      {children}
    </H>
  );
};

export default Header;
