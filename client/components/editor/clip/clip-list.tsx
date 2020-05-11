import React, { useState, useCallback, useEffect } from 'react';
import update from 'immutability-helper';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Block } from 'baseui/block';
import Clip, { ClipWithCaption } from './clip';
import { Edition as EditionType, Clip as ClipType } from 'types';
import { GET_EDITION } from '../menu';

const REORDER_CLIP = gql`
  mutation reorderClip($eid: ID!, $id: ID!, $newIndex: Int!) {
    reorderClip(eid: $eid, id: $id, newIndex: $newIndex) {
      id
      ts
      tsEnd
      order
      thumbnail
    }
  }
`;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

type ClipsProps = {
  clips: ClipWithCaption[];
  eid: string;
};

const Clips: React.FC<ClipsProps> = ({ clips: _clips, eid }) => {
  const [clips, setClips] = useState<ClipWithCaption[]>(_clips);
  const [reorderClip] = useMutation<
    { reorderClip: ClipType[] },
    { id: string; eid: string; newIndex: number }
  >(REORDER_CLIP, {
    update(cache, { data: { reorderClip } }) {
      if (!reorderClip) {
        return;
      }

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
            edition: { clips: { $set: reorderClip } },
          }),
        });
      }
    },
  });

  const onDragEnd = useCallback(
    (result) => {
      // dropped outside the list
      if (!result.destination) {
        return;
      }

      // Drag to original place
      if (result.source.index === result.destination.index) {
        return;
      }

      const items = reorder(
        clips,
        result.source.index,
        result.destination.index,
      ) as ClipWithCaption[];
      setClips(items);

      reorderClip({
        variables: {
          eid: eid,
          id: result.draggableId,
          newIndex: result.destination.index,
        },
      });
    },
    [eid, clips, reorderClip],
  );

  useEffect(() => {
    setClips(_clips);
  }, [_clips]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <Block
            {...provided.droppableProps}
            ref={provided.innerRef}
            backgroundColor="primary100" // snapshot.isDragginOver
            overrides={{
              Block: {
                style: ({ $theme }) => ({
                  padding: $theme.sizing.scale0,
                  borderTopLeftRadius: $theme.borders.surfaceBorderRadius,
                  borderTopRightRadius: $theme.borders.surfaceBorderRadius,
                  borderBottomLeftRadius: $theme.borders.surfaceBorderRadius,
                  borderBottomRightRadius: $theme.borders.surfaceBorderRadius,
                }),
              },
            }}
          >
            {clips.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <Block
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    backgroundColor={
                      snapshot.isDragging
                        ? 'backgroundLightNegative'
                        : 'primaryB'
                    }
                    marginBottom="scale0"
                    paddingTop="scale300"
                    paddingBottom="scale300"
                    paddingLeft="scale300"
                    paddingRight="scale300"
                    style={provided.draggableProps.style}
                  >
                    <Clip key={item.id} eid={eid} {...item} />
                  </Block>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Block>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Clips;
