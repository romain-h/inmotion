import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { StyledSpinnerNext as Spinner, SIZE } from 'baseui/spinner';
import { Edition as EditionType } from 'types';
import VideoPlayer, { PlayerProps } from './player';

export const GET_VIDEO_SRC = gql`
  query GetVideoSrc($id: String!) {
    edition(id: $id) {
      id
      video {
        id
        src
      }
    }
  }
`;

const RawVideo: React.FC<
  {
    eid: string;
  } & PlayerProps
> = ({ eid, player, setPlayer }) => {
  const { loading, error, data } = useQuery<
    { edition: EditionType },
    { id: string }
  >(GET_VIDEO_SRC, {
    variables: { id: eid },
  });

  if (loading) {
    return <Spinner size={SIZE.large} />;
  }

  if (error) {
    return <p>DAMNF </p>;
  }

  return (
    <VideoPlayer
      player={player}
      setPlayer={setPlayer}
      src={data.edition.video.src}
    />
  );
};

export default RawVideo;
