class Inventory {
  /**
   * A segment inventory
   * @param {Segment[]} segments List of segments in this inventory
   */
  constructor(segments) {
    this.segments = segments;
  }

  /**
   * Transform all phonemes in this inventory according to partial featural
   * specifications
   * @param {Object} partialFeatSpecsDict Partial featural specifications dict
   * @param {Object} ruleFilter Rule filter, for resolving Greek variables in alpha notation
   * @returns {Inventory} New transformed inventory
   */
  transform(partialFeatSpecsDict, ruleFilter) {
    return new Inventory(this.segments.map(seg => seg.transform(partialFeatSpecsDict, ruleFilter)));
  }

  /**
   * Filter segments that match the given partial featural specifications
   * @param {Object} partialFeatSpecsDict Partial featural specifications dict
   * @returns {Inventory} New filtered inventory
   */
  filter(partialFeatSpecsDict) {
    return new Inventory(this.segments.filter(seg => seg.match(partialFeatSpecsDict)));
  }

  /**
   * Get a list of features where the feature values of segments in this
   * inventory are not all the same
   * @param {String[]} includeFeatures List of features to always include in this list
   * @returns {String[]} List of non-redundant features
   */
  getNonRedundantFeatures(includeFeatures=[]) {
    if (this.nonRedundantFeatures) {
      return merge(this.nonRedundantFeatures, includeFeatures);
    }
    if (this.segments.length === 0) return includeFeatures;

    this.nonRedundantFeatures = [];
    const firstSegment = this.segments[0];

    const allFeatures = Object.keys(firstSegment.getFeatSpecs().getDict())

    for (let feature of allFeatures) {
      let targetFeatValue = firstSegment.getFeatSpecs().getDict()[feature];
      for (let segment of this.segments) {
        if (segment.getFeatSpecs().getDict()[feature] !== targetFeatValue) {
          this.nonRedundantFeatures.push(feature);
          break;
        }
      }
    }

    return merge(this.nonRedundantFeatures, includeFeatures);
  }

  toString() {
    return this.segments.toString();
  }


}

const merge = (a, b, predicate = (a, b) => a === b) => {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
  return c;
}

export default Inventory;