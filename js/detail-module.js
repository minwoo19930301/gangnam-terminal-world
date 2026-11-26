// Load a detail once, share it across placements, and leave failed loads retryable.
export function detailResource(fetchValue) {
  let value;
  let request;
  let attempts = 0;
  return {
    get ready() { return value !== undefined; },
    get value() { return value; },
    load() {
      if (request) return request;
      request = fetchValue(++attempts)
        .then(result => { value = result; })
        .catch(error => {
          request = undefined;
          throw error;
        });
      return request;
    }
  };
}

// Browsers cache failed module imports. A retry needs a new module URL.
export function detailModule(url, select) {
  return detailResource(attempt => {
    const source = new URL(url);
    if (attempt > 1) source.searchParams.set('retry', attempt);
    return import(source.href).then(select);
  });
}
