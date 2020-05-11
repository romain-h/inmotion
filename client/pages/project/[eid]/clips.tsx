import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Block } from 'baseui/block';
import Header from 'components/layout/header';
import { Content } from 'components/ui/content';
import ProtectedPage from 'components/protected-page';
import {
  EditorContent,
  EditorLeft,
  EditorRight,
} from 'components/editor/layout';
import TranscriptLoader from 'components/editor/transcript-loader';
import EditorMenu from 'components/editor/menu';
import EditorTitle from 'components/editor/title';
import Clips from 'components/editor/clip/clips';
import PreviewMontage from 'components/editor/preview-montage';
import videojs from 'video.js';
import { useDocumentEventListener } from 'lib/hooks/use-doc-evt-lst';

export default () => {
  const router = useRouter();
  const [player, setPlayer] = useState<videojs.Player>();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const { eid } = router.query;

  useDocumentEventListener('keydown', (event) => {
    // @ts-ignore keyCode
    if (event.target === document.body && event.keyCode === 32) {
      if (!player) {
        return;
      }

      if (player.paused()) {
        player.play();
      } else {
        player.pause();
      }
      event.preventDefault();
    }
  });

  useEffect(() => {
    if (!player) {
      return;
    }
    player.on('timeupdate', function () {
      setCurrentTime(player.currentTime());
    });
  }, [player, currentTime, setCurrentTime]);

  if (!eid) {
    return null;
  }

  const eidStr = eid as string;

  return (
    <ProtectedPage>
      <Header $hasSubmenu renderTitle={() => <EditorTitle eid={eidStr} />}>
        <EditorMenu eid={eidStr} />
      </Header>
      <Content>
        <TranscriptLoader eid={eidStr}>
          <Block flexDirection="column">
            <EditorContent>
              <EditorLeft>
                <Clips eid={eidStr} />
              </EditorLeft>
              <EditorRight>
                <PreviewMontage
                  eid={eidStr}
                  player={player}
                  setPlayer={setPlayer}
                />
              </EditorRight>
            </EditorContent>
          </Block>
        </TranscriptLoader>
      </Content>
    </ProtectedPage>
  );
};
