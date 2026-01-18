import { getShadowRoot } from '../test-util';

describe('jubel-landing', (): void => {
  const JUBEL_LANDING_TAG: string = 'jubel-landing';
  const TITLE_ID: string = 'jubel-landing-title';

  beforeEach((): void => {
    document.body.innerHTML = '<jubel-landing></jubel-landing>';
  });

  afterEach((): void => {
    document.body.getElementsByTagName(JUBEL_LANDING_TAG)[0].remove();
  });

  it('renders title', (): void => {
    const expectedText: string = 'Jubel';
    const renderedText: string = getShadowRoot(JUBEL_LANDING_TAG)!.getElementById(TITLE_ID)!.innerText;
    expect(expectedText).toEqual(renderedText);
  });
});
