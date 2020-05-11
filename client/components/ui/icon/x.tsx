import React from 'react';
import { Base, BaseProps } from './base';

export const X: React.FC<BaseProps> = (props) => (
  <Base {...props} title="x">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </Base>
);
