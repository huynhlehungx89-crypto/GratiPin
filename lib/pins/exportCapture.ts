/**
 * Prepare a DOM subtree for html-to-image capture.
 * Strips CSS filter/blur (common cause of black exports) and sets crossOrigin on images.
 */
export function prepareNodeForExport(root: HTMLElement): () => void {
  const restores: Array<() => void> = [];

  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.filter && style.filter !== "none") {
      const prev = el.style.filter;
      el.style.filter = "none";
      restores.push(() => {
        el.style.filter = prev;
      });
    }
    if (style.backdropFilter && style.backdropFilter !== "none") {
      const prev = el.style.backdropFilter;
      el.style.backdropFilter = "none";
      restores.push(() => {
        el.style.backdropFilter = prev;
      });
    }
  });

  root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
    const prev = img.crossOrigin;
    if (img.crossOrigin !== "anonymous") {
      img.crossOrigin = "anonymous";
      restores.push(() => {
        img.crossOrigin = prev;
      });
    }
  });

  return () => {
    for (let i = restores.length - 1; i >= 0; i--) {
      restores[i]();
    }
  };
}
