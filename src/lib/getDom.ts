import { Window } from "happy-dom";
import memoize from "./memoize";

const getDom = memoize((html: string) => {
  const window = new Window({
    settings: {
      disableJavaScriptFileLoading: true,
      disableJavaScriptEvaluation: true,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableComputedStyleRendering: true,
    },
  });

  window.document.body.innerHTML = html;

  return window;
});

export default getDom;
