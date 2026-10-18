import { cacheFiles, type FilesProgress, type WarmRequest } from "./cache-files";

/* Caches the site's files off the page (see cache-files.ts), reporting progress, then "done". */

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<WarmRequest>) => void) | null;
  postMessage: (message: FilesProgress | { stage: "done" }) => void;
};

scope.onmessage = (event) => {
  cacheFiles(event.data, (progress) => scope.postMessage(progress)).finally(() => scope.postMessage({ stage: "done" }));
};
