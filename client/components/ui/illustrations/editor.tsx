import React from 'react';
import { useStyletron } from 'baseui';

const DURATION = '2s';
const COUNT = 'infinite';
const DELAY = '2.5s';
const TIMING = 'linear';

export const EditorIllustration = ({ width }) => {
  const [css] = useStyletron();

  const hl1 = {
    from: { width: '0px' },
    '50%': { width: '71px' },
    to: { width: '71px' },
  };

  const hl2 = {
    from: { width: '0px' },
    '20%': { width: '0px' },
    '65%': { width: '90px' },
    to: { width: '90px' },
  };
  const hl3 = {
    from: { width: '0px' },
    '65%': { width: '0px' },
    '85%': { width: '63px' },
    to: { width: '63px' },
  };

  const btn = {
    from: { opacity: 0 },
    '85%': { opacity: 0 },
    to: { opacity: 1 },
  };

  const mouse = {
    from: { transform: 'translate(0, 0)' },
    '85%': { transform: 'translate(43px, 22px)' },
    '93%': { transform: 'translate(36px, 14px)' },
    to: { transform: 'translate(36px, 14px)' },
  };

  return (
    <svg
      width={width}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 110 136"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        id="box"
        x="0.5"
        y="0.5"
        width="109"
        height="135"
        fill="white"
        stroke="#BDBDBD"
      />
      <g id="highlight">
        <rect
          id="hl1"
          className={css({
            animationName: hl1,
            animationDuration: DURATION,
            animationDirection: 'normal',
            animationDelay: DELAY,
            animationIterationCount: COUNT,
            animationTimingFunction: TIMING,
          })}
          x="29"
          y="22"
          width="0"
          height="7"
          fill="#C4C4C4"
        />
        <rect
          id="hl2"
          className={css({
            animationName: hl2,
            animationDuration: DURATION,
            animationDirection: 'normal',
            animationDelay: DELAY,
            animationIterationCount: COUNT,
            animationTimingFunction: TIMING,
          })}
          x="10"
          y="32"
          width="0"
          height="7"
          fill="#C4C4C4"
        />
        <rect
          id="hl3"
          className={css({
            animationName: hl3,
            animationDuration: DURATION,
            animationDirection: 'normal',
            animationDelay: DELAY,
            animationIterationCount: COUNT,
            animationTimingFunction: TIMING,
          })}
          x="10"
          y="42"
          width="0"
          height="7"
          fill="#C4C4C4"
        />
      </g>
      <g id="text">
        <line id="Line 1" x1="10" y1="15.5" x2="100" y2="15.5" stroke="black" />
        <line id="Line 2" x1="10" y1="25.5" x2="100" y2="25.5" stroke="black" />
        <line id="Line 3" x1="10" y1="35.5" x2="100" y2="35.5" stroke="black" />
        <line id="Line 4" x1="10" y1="45.5" x2="100" y2="45.5" stroke="black" />
        <line id="Line 5" x1="10" y1="55.5" x2="100" y2="55.5" stroke="black" />
        <line id="Line 6" x1="10" y1="65.5" x2="100" y2="65.5" stroke="black" />
        <line id="Line 7" x1="10" y1="75.5" x2="100" y2="75.5" stroke="black" />
        <line id="Line 8" x1="10" y1="85.5" x2="100" y2="85.5" stroke="black" />
        <line id="Line 9" x1="10" y1="95.5" x2="60" y2="95.5" stroke="black" />
      </g>
      <g
        id="button"
        className={css({
          animationName: btn,
          animationDuration: DURATION,
          animationDirection: 'normal',
          animationDelay: DELAY,
          animationIterationCount: COUNT,
          animationTimingFunction: TIMING,
          opacity: 0,
        })}
      >
        <rect
          id="Rectangle 4"
          x="51"
          y="32"
          width="22"
          height="10"
          fill="#050505"
        />
        <path id="Vector" d="M62.5 34L62.5 39M60 36.5H65" stroke="white" />
      </g>
      <g
        id="mouse"
        className={css({
          animationName: mouse,
          animationDuration: DURATION,
          animationDirection: 'normal',
          animationDelay: DELAY,
          animationIterationCount: COUNT,
          animationTimingFunction: TIMING,
        })}
      >
        <path
          id="mouse1"
          d="M30.375 24.375L33.6154 32.1529L34.7658 28.7658L38.1529 27.6154L30.375 24.375Z"
          fill="white"
          stroke="#413B3B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id="mouse2"
          d="M34.9583 28.9583L37.7083 31.7083"
          stroke="#413B3B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
