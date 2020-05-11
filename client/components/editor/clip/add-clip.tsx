import React from 'react';
import update from 'immutability-helper';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Button } from 'baseui/button';
import { toaster, ToasterContainer, PLACEMENT } from 'baseui/toast';
import { Edition as EditionType, ClipInput, Clip as ClipProps } from 'types';
import { GET_EDITION } from '../menu';

const CREATE_CLIP = gql`
  mutation CreateClip($input: ClipInput!) {
    createClip(input: $input) {
      id
      ts
      tsEnd
      order
      thumbnail
    }
  }
`;

type AddClipProps = {
  eid: string;
  selection: [number, number];
  open: boolean;
};

const AddClip = React.forwardRef<HTMLButtonElement, AddClipProps>(
  ({ eid, selection, open }, ref) => {
    const [createClip, { loading }] = useMutation<
      { createClip: ClipProps },
      { input: ClipInput }
    >(CREATE_CLIP, {
      refetchQueries: ['GetEditionPreview'],
      update(cache, { data }) {
        if (!data.createClip) {
          return;
        }
        toaster.positive(<>Clip added</>, {
          overrides: {
            InnerContainer: {
              style: { width: '100%' },
            },
          },
        });

        const cachedData: {
          edition: EditionType | null;
        } | null = cache.readQuery({
          query: GET_EDITION,
          variables: { id: eid },
        });

        if (cachedData && cachedData.edition) {
          cache.writeQuery({
            query: GET_EDITION,
            data: update(cachedData, {
              edition: { clips: { $push: [data.createClip] } },
            }),
          });
        }
      },
    });

    return (
      <ToasterContainer
        placement={PLACEMENT.bottomRight}
        autoHideDuration={3500}
      >
        <Button
          // @ts-ignore
          ref={ref}
          overrides={{
            BaseButton: {
              style: {
                display: open ? 'block' : 'none',
              },
            },
          }}
          onClick={() =>
            createClip({
              variables: {
                input: {
                  eid: eid,
                  ts: selection[0],
                  tsEnd: selection[1],
                },
              },
            })
          }
          isLoading={loading}
        >
          Add clip
        </Button>
      </ToasterContainer>
    );
  },
);

export default AddClip;
