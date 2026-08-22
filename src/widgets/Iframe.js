import Base from './Base';

/**
 * Common class for all iframes, and the fallback for every other embed.
 *
 * Restoring the source is the same job for every tag, so `Base` does it in
 * `restoreSource()` and there is nothing left to specialize here.
 */
class Iframe extends Base {
}

export default Iframe;
