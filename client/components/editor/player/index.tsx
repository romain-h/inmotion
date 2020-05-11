import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';

export type Player = videojs.Player;

export type PlayerProps = videojs.PlayerOptions & {
  player?: Player;
  setPlayer: (Player) => void;
};

const defaultOptions = {
  controls: true,
  fluid: true,
  userActions: {
    doubleClick: false,
  },
  children: {
    bigPlayButton: false,
    controlBar: {
      fullscreenToggle: false,
      pictureInPictureToggle: false,
    },
  },
};

const VideoPlayer: React.FC<PlayerProps> = ({
  player,
  setPlayer,
  src,
  ...props
}) => {
  const videoNode = useRef(null);

  useEffect(() => {
    if (!player) {
      const newPlayer = videojs(videoNode.current, {
        ...defaultOptions,
        ...props,
      });
      setPlayer(newPlayer);
    }
  }, [props, player, setPlayer]);

  // onUnmount
  useEffect(() => {
    if (player) {
      setPlayer(null);
    }
  }, []);

  useEffect(() => {
    if (player && src) {
      player.src(src);
    }
  }, [player, src]);

  return (
    <div data-vjs-player>
      <video ref={videoNode} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;
