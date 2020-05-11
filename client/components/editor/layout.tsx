import React, { ReactNode } from 'react';
import { Block } from 'baseui/block';

export const EditorContent: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <Block display="flex" height="calc(100vh - 64px - 42px)">
    {children}
  </Block>
);

export const EditorLeft: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Block width="45%" backgroundColor="white" overflow="auto">
    {children}
  </Block>
);

export const EditorRight: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <Block
    marginLeft="scale300"
    width="55%"
    display="flex"
    flexDirection="column"
    justifyContent="center"
  >
    {children}
  </Block>
);
