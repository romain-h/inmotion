import React, { useState } from 'react';
import { Block } from 'baseui/block';
import { SubMenuItem } from 'components/ui/sub-menu';
import { CloudDownload } from 'components/ui/icon/cloud-download';
import { DownloadModal } from './download-modal';

const ExportMenuItem: React.FC<{ eid: string; $disabled: boolean }> = ({
  eid,
  $disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <SubMenuItem
        $as="div"
        $disabled={$disabled}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Block
          display="inline-block"
          top="3px"
          position="relative"
          marginRight="scale500"
        >
          <CloudDownload size="scale600" color="currentColor" />
        </Block>
        Export
      </SubMenuItem>
      <DownloadModal eid={eid} isOpen={isOpen} onClose={close} />
    </>
  );
};

export default ExportMenuItem;
