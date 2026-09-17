/**
 * Helper to convert a HTMLCollection to a plain array
 *
 * @param {HTMLCollection} collection
 */
const toArray = (collection) => {
  return Array.prototype.slice.call(collection);
};

export { toArray };
