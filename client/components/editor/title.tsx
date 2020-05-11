import React, { useState } from 'react';
import gql from 'graphql-tag';
import Link from 'next/link';
import { useQuery } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import { Label2 } from 'baseui/typography';
import { Link as StyledLink } from 'components/ui/link';
import { Divider } from 'components/ui/icon/divider';
import { Edit } from 'components/ui/icon/edit';
import { RenameVideoTitleModal } from './rename-title-modal';

export const GET_VIDEO_TITLE = gql`
  query GetVideoTitle($id: String!) {
    edition(id: $id) {
      id
      video {
        id
        title
      }
    }
  }
`;

type EditorMenuProps = {
  eid: string;
};

const EditorTitle: React.FC<EditorMenuProps> = ({ eid }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const { loading, error, data } = useQuery(GET_VIDEO_TITLE, {
    variables: { id: eid },
  });

  if (error || loading) {
    return null;
  }

  return (
    <Block display="flex" alignItems="center">
      <Divider color="borderOpaque" size="scale1000" />
      <Link href="/projects" passHref>
        <StyledLink>My Projects</StyledLink>
      </Link>
      <Divider color="borderOpaque" size="scale1000" />
      <Block
        display="flex"
        overrides={{
          Block: {
            props: {
              onMouseEnter: () => setIsHovered(true),
              onMouseLeave: () => setIsHovered(false),
              onClick: () => {
                setIsOpen(true);
              },
            },
          },
        }}
      >
        <Label2>{data.edition.video.title}</Label2>
        {isHovered && <Edit paddingLeft="scale300" color="currentColor" />}
      </Block>
      <RenameVideoTitleModal
        vid={data.edition.video.id}
        title={data.edition.video.title}
        isOpen={isOpen}
        onClose={close}
      />
    </Block>
  );
};

export default EditorTitle;
