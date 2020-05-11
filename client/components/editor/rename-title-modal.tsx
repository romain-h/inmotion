import React, { useCallback } from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useForm, Controller } from 'react-hook-form';
import { StatefulInput } from 'baseui/input';
import { KIND as ButtonKind } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE,
} from 'baseui/modal';

export const UPDATE_VIDEO_TITLE = gql`
  mutation updateVideoTitle($id: ID!, $title: String!) {
    updateVideoTitle(id: $id, title: $title) {
      id
      title
    }
  }
`;

export const RenameVideoTitleModal: React.FC<{
  vid: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ vid, title, isOpen, onClose }) => {
  const { handleSubmit, control } = useForm<{ title: string }>();
  const [updateTitle, { loading }] = useMutation(UPDATE_VIDEO_TITLE, {
    onCompleted() {
      onClose();
    },
  });

  const onSubmit = useCallback(
    (values) => {
      updateTitle({
        variables: {
          id: vid,
          title: values.title,
        },
      });
    },
    [vid, updateTitle],
  );

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
    >
      <ModalHeader>Change title</ModalHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Controller
            as={StatefulInput}
            name="title"
            placeholder={title}
            control={control}
            rules={{ required: true }}
          />
        </ModalBody>
        <ModalFooter>
          <ModalButton onClick={() => onClose()} kind={ButtonKind.tertiary}>
            Cancel
          </ModalButton>
          <ModalButton isLoading={loading} type="submit">
            Update
          </ModalButton>
        </ModalFooter>
      </form>
    </Modal>
  );
};
