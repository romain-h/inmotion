import React from 'react';
import { Base, BaseProps } from './base';

export const Edit: React.FC<BaseProps> = (props) => (
  <Base {...props} title="edit">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </Base>
);
