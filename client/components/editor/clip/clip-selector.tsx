import React, { useState } from 'react';
import { createPopper } from '@popperjs/core';
import AddClip from './add-clip';
import { useDocumentEventListener } from 'lib/hooks/use-doc-evt-lst';

type ClipSelectorProps = {
  eid: string;
  // TODO define type transcript
  transcript: any;
};

type ClipSelection = [number, number];

const ClipSelector: React.FC<ClipSelectorProps> = ({
  eid,
  transcript,
  children,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | Element | null>(null);
  const [clip, setClip] = useState<ClipSelection>();

  const popupRef = React.createRef<HTMLButtonElement>();

  useDocumentEventListener('click', (event) => {
    if (
      anchorEl &&
      popupRef.current &&
      !popupRef.current.contains(event.target as Node)
    ) {
      setAnchorEl(null);
    }
  });

  return (
    <div
      onMouseUp={() => {
        const selection = window.getSelection();
        if (!selection) {
          return;
        }
        const range = selection.getRangeAt(0);
        let firstNode: HTMLElement | Element =
          range.startContainer.parentElement;
        let lastNode: HTMLElement | Element = range.endContainer.parentElement;

        if (firstNode == null || lastNode == null || firstNode === lastNode) {
          return;
        }

        let firstMatchingNode = transcript.find(
          (el) => el.ref.current === firstNode,
        );
        let lastMatchingNode = transcript.find(
          (el) => el.ref.current === lastNode,
        );

        const clip: ClipSelection = [
          firstMatchingNode.ts,
          lastMatchingNode.tsEnd,
        ];

        while (clip[0] == null && firstNode.previousElementSibling) {
          firstNode = firstNode.previousElementSibling;
          firstMatchingNode = transcript.find(
            // eslint-disable-next-line
            (el) => el.ref.current === firstNode,
          );
          clip[0] = firstMatchingNode.tsEnd;
        }

        while (
          clip[1] == null &&
          lastNode != null &&
          lastNode.nextElementSibling
        ) {
          lastNode = lastNode.nextElementSibling;
          lastMatchingNode = transcript.find(
            // eslint-disable-next-line
            (el) => el.ref.current === lastNode,
          );
          clip[1] = lastMatchingNode.ts;
        }

        setAnchorEl(lastNode);
        createPopper(lastNode, popupRef.current, {
          placement: 'top',
          strategy: 'fixed',
        });

        setClip(clip);
      }}
    >
      {children}
      <AddClip
        aria-label="Create clip"
        ref={popupRef}
        eid={eid}
        selection={clip}
        open={Boolean(anchorEl)}
      />
    </div>
  );
};

export default ClipSelector;
