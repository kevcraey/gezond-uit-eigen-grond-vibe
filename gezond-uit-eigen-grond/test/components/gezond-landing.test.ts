import { getShadowRoot } from '../test-util';

describe('gezond-landing', (): void => {
  const GEZOND_LANDING_TAG: string = 'gezond-landing';
  const TITLE_ID: string = 'gezond-landing-title';

  beforeEach((): void => {
    document.body.innerHTML = '<gezond-landing></gezond-landing>';
  });

  afterEach((): void => {
    document.body.getElementsByTagName(GEZOND_LANDING_TAG)[0].remove();
  });

  it('renders title', (): void => {
    const expectedText: string = 'Gezond uit eigen grond';
    const renderedText: string = getShadowRoot(GEZOND_LANDING_TAG)!.getElementById(TITLE_ID)!.innerText;
    expect(expectedText).toEqual(renderedText);
  });
});
