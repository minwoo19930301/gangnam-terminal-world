// Share a mesh packet across placements. Browsers remember failed module fetches,
// so each retry needs a fresh URL while successful imports keep their original URL.
export function detailModule(url, select) {
  let value;
  let request;
  let attempts = 0;
  return {
    get ready() { return value !== undefined; },
    get value() { return value; },
    load() {
      if (request) return request;
      const source = new URL(url);
      attempts += 1;
      if (attempts > 1) source.searchParams.set('retry', attempts);
      request = import(source.href)
        .then(module => { value = select(module); })
        .catch(error => {
          request = undefined;
          throw error;
        });
      return request;
    }
  };
}
