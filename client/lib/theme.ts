import { createTheme } from 'baseui';

const primitives = {
  a: '#98A2DF', // Experimental for now...
  primaryFontFamily: '"Inter", sans-serif',
};

const overrides = {
  colors: {
    textSelection: primitives.a,
    toastPositiveBackground: '#43bf75',
  },
  borders: {
    buttonBorderRadius: '5px',
    inputBorderRadius: '5px',
    surfaceBorderRadius: '5px',
  },
};
export const theme = createTheme(primitives, overrides);
