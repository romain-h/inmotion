import React from 'react';
import { Base, BaseProps } from './base';

export const CloudDownload: React.FC<BaseProps> = (props) => (
  <Base {...props} title="download">
    <polyline points="8 17 12 21 16 17"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>
  </Base>
);
