import React, { useEffect } from 'react';
import gql from 'graphql-tag';
import { useLazyQuery } from '@apollo/react-hooks';
import { KIND as ButtonKind } from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalFooter,
  ModalButton,
  SIZE,
  ROLE,
} from 'baseui/modal';

export const GET_EDITION_EXPORT = gql`
  query GetEditionExport($id: String!) {
    edition(id: $id) {
      id
      exportURL
    }
  }
`;

export const DownloadModal: React.FC<{
  eid: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ eid, isOpen, onClose }) => {
  const [getSrc, { loading, data }] = useLazyQuery(GET_EDITION_EXPORT, {
    variables: { id: eid },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!isOpen) return;
    getSrc();
  }, [isOpen, getSrc]);

  return (
    <Modal
      onClose={onClose}
      closeable
      isOpen={isOpen}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
    >
      <ModalHeader>Export</ModalHeader>
      <ModalFooter>
        <ModalButton onClick={() => onClose()} kind={ButtonKind.tertiary}>
          Cancel
        </ModalButton>
        <ModalButton
          // @ts-ignore error in BaseUI ts definition
          $as="a"
          href={data && data.edition ? data.edition.exportURL : '#'}
          isLoading={loading}
        >
          Download
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};
