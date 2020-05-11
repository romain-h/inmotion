import React from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import { StyledSpinnerNext as Spinner, SIZE } from 'baseui/spinner';
import VideoPlayer, { PlayerProps } from './player';

export const PREVIEW_UPDATE_SUBSCRIPTION = gql`
  subscription onPreviewUpdate($eid: ID!) {
    previewUpdate(eid: $eid) {
      loading
      url
    }
  }
`;

const PreviewMontage: React.FC<PlayerProps & { eid: string }> = ({
  eid,
  player,
  setPlayer,
}) => {
  const { loading, error, data } = useSubscription(
    PREVIEW_UPDATE_SUBSCRIPTION,
    {
      variables: { eid: eid },
    },
  );

  if (loading || (data && data.previewUpdate && data.previewUpdate.loading))
    return <Spinner size={SIZE.large} />;

  if (
    error ||
    (data &&
      data.previewUpdate &&
      !data.previewUpdate.loading &&
      !data.previewUpdate.url)
  ) {
    return <p>Something went wrong while rendering preview :( </p>;
  }

  return (
    <VideoPlayer
      player={player}
      setPlayer={setPlayer}
      src={data.previewUpdate.url}
    />
  );
};

export default PreviewMontage;
