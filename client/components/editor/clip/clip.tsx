import React, { useState } from 'react';
import update from 'immutability-helper';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Block } from 'baseui/block';
import { Grab } from 'baseui/icon';
import { Button, KIND, SIZE } from 'baseui/button';
import { X } from 'components/ui/icon/x';
import { Caption } from 'components/ui/caption';
import {
  Clip as ClipType,
  Edition as EditionType,
  MonologueElement,
} from 'types';
import { GET_EDITION } from '../menu';

const REMOVE_CLIP = gql`
  mutation removeClip($eid: ID!, $id: String!) {
    removeClip(eid: $eid, id: $id)
  }
`;

export type ClipWithCaption = ClipType & {
  caption: MonologueElement[];
};

const Clip: React.FC<ClipWithCaption & { eid: string }> = ({
  id,
  thumbnail,
  eid,
  caption,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [removeClip] = useMutation(REMOVE_CLIP, {
    update(cache, { data: { removeClip } }) {
      if (!removeClip) {
        return;
      }

      const cachedData: {
        edition: EditionType | null;
      } | null = cache.readQuery({
        query: GET_EDITION,
        variables: { id: eid },
      });

      if (cachedData && cachedData.edition && cachedData.edition.clips) {
        const index = cachedData.edition.clips.findIndex(
          (f) => f && f.id === id,
        );
        cache.writeQuery({
          query: GET_EDITION,
          data: update(cachedData, {
            edition: { clips: { $splice: [[index, 1]] } },
          }),
        });
      }
    },
  });

  return (
    <Block display="flex" flexDirection="column">
      <Block
        display="flex"
        alignItems="center"
        overrides={{
          Block: {
            props: {
              onMouseEnter: () => setIsHovered(true),
              onMouseLeave: () => setIsHovered(false),
            },
          },
        }}
      >
        <Block flex="1 0 auto" margin="scale300">
          <Grab />
        </Block>
        <Block flex="1 1 auto" overflow="hidden">
          <Block as="img" src={thumbnail} />
        </Block>
        <Block marginLeft="scale400">
          {isHovered && (
            <Button
              kind={KIND.minimal}
              size={SIZE.compact}
              onClick={() =>
                removeClip({
                  variables: { eid, id },
                })
              }
            >
              <X color="currentColor" />
            </Button>
          )}
        </Block>
      </Block>
      <Block marginLeft="scale900" marginRight="scale300">
        {caption && <Caption>{caption.map((el) => el.value).join('')}</Caption>}
      </Block>
    </Block>
  );
};

export default Clip;
