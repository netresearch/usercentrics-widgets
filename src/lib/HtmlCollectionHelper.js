/**
 * Helper to convert a HTMLCollection to an immutable array
 *
 * @param {HTMLCollection} collection
 */
const toArray = (collection) => {
  return Array.prototype.slice.call(collection);
};

export { toArray };
