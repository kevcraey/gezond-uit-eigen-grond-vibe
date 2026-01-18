export const getShadowRoot = (tagName: string): ShadowRoot | null => {
  return document.body.getElementsByTagName(tagName)[0].shadowRoot;
};
