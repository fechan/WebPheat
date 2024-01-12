import Segment from "./Segment.mjs";

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
   * @returns {Inventory} New transformed inventory
   */
  transform(partialFeatSpecsDict) {
    return new Inventory(this.segments.map(seg => seg.transform(partialFeatSpecsDict)));
  }

  /**
   * Filter segments that match the given partial featural specifications
   * @param {Object} partialFeatSpecsDict Partial featural specifications dict
   * @returns {Inventory} New filtered inventory
   */
  filter(partialFeatSpecsDict) {
    return new Inventory(this.segments.filter(seg => seg.match(partialFeatSpecsDict)));
  }

  toString() {
    return this.segments.toString();
  }
}

export default Inventory;