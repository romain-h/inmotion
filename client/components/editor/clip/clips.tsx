import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import { fragments as fragsTranscript } from '../transcript';
import { useQuery } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import { StyledSpinnerNext as Spinner, SIZE } from 'baseui/spinner';
import { ClipWithCaption } from './clip';
import { Edition as EditionType } from 'types';
import ClipList from './clip-list';

export const GET_CLIPS = gql`
  query GetClips($id: String!) {
    edition(id: $id) {
      id
      clips {
        id
        ts
        tsEnd
        order
        thumbnail
      }
      video {
        id
        ...TranscriptContent
      }
    }
  }
  ${fragsTranscript.video}
`;

type ClipsProps = {
  eid: string;
};

const Clips: React.FC<ClipsProps> = ({ eid }) => {
  const [clips, setClips] = useState<ClipWithCaption[]>();
  const { loading, error, data } = useQuery<
    { edition: EditionType },
    { id: string }
  >(GET_CLIPS, {
    variables: { id: eid },
  });

  // TODO extract in own file
  useEffect(() => {
    if (data && data.edition.video.transcript.monologues) {
      const clips = data.edition.clips.map((clip) => ({
        ...clip,
        caption: [],
      }));

      type collecting = 'NONE' | 'IN_PROGRESS' | 'DONE';
      const collectorStatus: collecting[] = clips.map((c) => 'NONE');

      data.edition.video.transcript.monologues.forEach((mono) => {
        // Distribute monologues to clips
        mono.elements.forEach((el) => {
          clips.forEach((clip, i) => {
            if (clip.ts <= el.ts && collectorStatus[i] === 'NONE') {
              collectorStatus[i] = 'IN_PROGRESS';
            }
            if (el.tsEnd > clip.tsEnd && collectorStatus[i] === 'IN_PROGRESS') {
              collectorStatus[i] = 'DONE';
            }
            if (collectorStatus[i] === 'IN_PROGRESS') {
              clip.caption.push(el);
            }
          });
        });
      });
      setClips(clips);
    }
  }, [data]);

  if (loading || !clips) {
    return (
      <Block justifyContent="center" marginTop="scale500">
        <Spinner size={SIZE.large} />
      </Block>
    );
  }
  if (error) return <p>Error :(</p>;

  return <ClipList eid={eid} clips={clips} />;
};

export default Clips;
