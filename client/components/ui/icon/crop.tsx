import React from 'react';
import { Base, BaseProps } from './base';

export const Crop: React.FC<BaseProps> = (props) => (
  <Base {...props} title="crop">
    <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path>
    <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>
  </Base>
);
