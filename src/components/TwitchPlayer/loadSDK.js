import loadScript from 'load-script';

const SDK_URL = 'https://player.twitch.tv/js/embed/v1.js';
const SDK_GLOBAL = 'Twitch';

const resolves = {};
export function getSDK(
  url = SDK_URL,
  sdkGlobal = SDK_GLOBAL,
  sdkReady = null,
  isLoaded = () => true,
  fetchScript = loadScript
) {
  if (window[sdkGlobal] && isLoaded()) {
    return Promise.resolve(window[sdkGlobal]);
  }
  return new Promise((resolve, reject) => {
    if (resolves[url]) {
      resolves[url].push(resolve);
      return;
    }
    resolves[url] = [resolve];
    const onLoaded = sdk => {
      resolves[url].forEach(res => res(sdk));
    };
    if (sdkReady) {
      const previousOnReady = window[sdkReady];
      window[sdkReady] = () => {
        if (previousOnReady) {
          previousOnReady();
        }
        onLoaded(window[sdkGlobal]);
      };
    }
    fetchScript(url, err => {
      if (err) {
        reject(err);
      }
      if (!sdkReady) {
        onLoaded(window[sdkGlobal]);
      }
    });
  });
}