import React, { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import { SubMenu, SubMenuItem } from 'components/ui/sub-menu';
import { Film } from 'components/ui/icon/film';
import { Video } from 'components/ui/icon/video';
import ExportMenuItem from './export-menu-item';

export const GET_EDITION = gql`
  query GetEdition($id: String!) {
    edition(id: $id) {
      id
      clips {
        id
        ts
        tsEnd
        order
        thumbnail
      }
    }
  }
`;

type EditorMenuProps = {
  eid: string;
};

const EditorMenu: React.FC<EditorMenuProps> = ({ eid }) => {
  const { pathname, query } = useRouter();
  const [count, setCount] = useState<number>(0);
  const { data } = useQuery(GET_EDITION, {
    variables: { id: eid },
  });

  useEffect(() => {
    if (data && data.edition.clips) {
      const c = data.edition.clips.length;
      setCount(c);
      if (c === 0 && pathname === '/project/[eid]/clips') {
        Router.push('/project/[eid]', `/project/${query.eid}`);
      }
    }
  }, [data, pathname, query.eid]);

  return (
    <SubMenu>
      <Link href="/project/[eid]" as={`/project/${eid}`} passHref>
        <SubMenuItem $active={pathname === '/project/[eid]'}>
          <Block
            display="inline-block"
            top="3px"
            position="relative"
            marginRight="scale500"
          >
            <Video size="scale600" color="currentColor" />
          </Block>
          Video
        </SubMenuItem>
      </Link>
      <Link href="/project/[eid]/clips" as={`/project/${eid}/clips`} passHref>
        <SubMenuItem
          $active={pathname === '/project/[eid]/clips'}
          $disabled={count === 0}
        >
          <Block
            display="inline-block"
            top="3px"
            position="relative"
            marginRight="scale500"
          >
            <Film size="scale600" color="currentColor" />
          </Block>
          Clips ({count})
        </SubMenuItem>
      </Link>
      <Block margin="auto" />
      <ExportMenuItem eid={eid} $disabled={count === 0} />
    </SubMenu>
  );
};

export default EditorMenu;
