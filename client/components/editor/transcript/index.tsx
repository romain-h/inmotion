import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Card } from 'baseui/card';
import { Block } from 'baseui/block';
import { StyledSpinnerNext as Spinner, SIZE } from 'baseui/spinner';
import { Edition as EditionType, MonologueElement } from 'types';
import { TranscriptBody } from 'components/ui/transcript-body';
import { Word } from 'components/ui/word';
import ClipSelector from '../clip/clip-selector';

export const fragments = {
  video: gql`
    fragment TranscriptContent on Video {
      transcript {
        monologues {
          speaker
          elements {
            type
            value
            ts
            tsEnd
          }
        }
      }
    }
  `,
};

export const GET_TRANSCRIPT = gql`
  query GetTranscript($id: String!) {
    edition(id: $id) {
      id
      video {
        id
        ...TranscriptContent
      }
    }
  }
  ${fragments.video}
`;

type TranscriptProps = {
  eid: string;
  currentTime: number;
  setCurrentTime: (cs: number) => void;
};

type WordType = MonologueElement & {
  ref: React.Ref<HTMLSpanElement>;
};

const isCurrent = (el, currentTime) => {
  return el.ts <= currentTime && currentTime < el.tsEnd;
};

const Transcript: React.FC<TranscriptProps> = ({
  eid,
  currentTime,
  setCurrentTime,
}) => {
  const [transcript, setTranscript] = useState<[WordType]>();
  const { loading, error, data } = useQuery<
    { edition: EditionType },
    { id: string }
  >(GET_TRANSCRIPT, {
    variables: { id: eid },
  });

  // TODO extract in own file
  useEffect(() => {
    if (data && data.edition.video.transcript.monologues) {
      const content = data.edition.video.transcript.monologues.map((mono) =>
        mono.elements.map((el) => ({
          ...el,
          ref: React.createRef(),
        })),
      );
      // flatten
      const fullTranscript = [].concat(...content);
      setTranscript(fullTranscript as [WordType]);
    }
  }, [data, setTranscript]);

  if (loading) {
    return (
      <Block justifyContent="center" marginTop="scale500">
        <Spinner size={SIZE.large} />
      </Block>
    );
  }
  if (error) return <p>Error :(</p>;

  if (!transcript || transcript.length < 1) {
    return null;
  }

  return (
    <Card>
      <ClipSelector eid={eid} transcript={transcript}>
        <TranscriptBody>
          {transcript.map((el, i) => (
            <Word
              key={i}
              ref={el.ref}
              $isCurrent={isCurrent(el, currentTime)}
              onClick={() => setCurrentTime(el.ts)}
            >
              {el.value}
            </Word>
          ))}
        </TranscriptBody>
      </ClipSelector>
    </Card>
  );
};

export default Transcript;
