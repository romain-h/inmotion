import React from 'react';
import { Block, BlockProps } from 'baseui/block';

export const Content: React.FC<BlockProps> = (props) => (
  <Block {...props} margin="auto" maxWidth="1140px" width="100%" />
);
