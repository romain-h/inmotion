import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Block } from 'baseui/block';
import { StyledSpinnerNext as Spinner, SIZE } from 'baseui/spinner';
import { ProgressBar } from 'baseui/progress-bar';
import { Label1, Label2 } from 'baseui/typography';
import { EditorIllustration } from 'components/ui/illustrations/editor';

export const CHECK_TRANSCRIPT = gql`
  query CheckTranscript($id: String!) {
    edition(id: $id) {
      id
      video {
        id
        isTranscriptReady
      }
    }
  }
`;

type TranscriptLoaderProps = {
  eid: string;
};

const TranscriptLoader: React.FC<TranscriptLoaderProps> = ({
  eid,
  children,
}) => {
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const { loading, error, data, stopPolling } = useQuery(CHECK_TRANSCRIPT, {
    variables: { id: eid },
    pollInterval: 3000,
  });

  useEffect(() => {
    if (data && data.edition.video.isTranscriptReady) {
      stopPolling();
    } else if (data && !data.edition.video.isTranscriptReady) {
      setTimeout(() => {
        setShowHelp(true);
      }, 5000);
    }
  }, [data, stopPolling, setShowHelp]);

  if (loading) {
    return (
      <Block display="flex" justifyContent="center" marginTop="scale500">
        <Spinner size={SIZE.large} />
      </Block>
    );
  }

  if (data && !data.edition.video.isTranscriptReady) {
    return (
      <Block
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        marginTop="scale500"
      >
        <Label1>
          Bear with us a minute, we are generating your transcript.
        </Label1>
        <Block width="250px" marginTop="scale500">
          <ProgressBar infinite />
        </Block>

        {showHelp && (
          <Block
            display="flex"
            justifyContent="center"
            marginTop="scale800"
            overrides={{
              Block: {
                style: {
                  opacity: 0.5,
                },
              },
            }}
          >
            <EditorIllustration width="450px" />
            <Label2 padding="scale600" alignSelf="center">
              Once ready, create your clips by selecting text from the
              transcript.
            </Label2>
          </Block>
        )}
      </Block>
    );
  }
  if (error) return <p>Error :(</p>;

  // wrap to comply with TS...
  return <>{children}</>;
};

export default TranscriptLoader;
