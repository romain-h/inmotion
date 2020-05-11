import React from 'react';
import { Base, BaseProps } from './base';

export const Video: React.FC<BaseProps> = (props) => (
  <Base {...props} title="video">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </Base>
);
