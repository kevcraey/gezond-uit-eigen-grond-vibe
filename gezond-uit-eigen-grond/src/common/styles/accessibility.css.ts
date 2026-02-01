import { css } from 'lit';

export const accessibilityStyles = css`
  /* Focus styles voor alle interactive elementen */
  *:focus {
    outline: 3px solid #0055CC;
    outline-offset: 2px;
  }

  /* Focus voor buttons */
  vl-button:focus {
    outline: 3px solid #0055CC;
    outline-offset: 2px;
  }

  /* Focus voor links */
  a:focus {
    outline: 3px solid #0055CC;
    outline-offset: 2px;
    background-color: #FFF7CC;
  }

  /* Focus voor inputs */
  vl-input-field:focus,
  vl-radio:focus {
    outline: 3px solid #0055CC;
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    *:focus {
      outline-width: 4px;
    }
  }

  /* Focus-visible voor mouse users */
  *:focus:not(:focus-visible) {
    outline: none;
  }

  *:focus-visible {
    outline: 3px solid #0055CC;
    outline-offset: 2px;
  }
`;
