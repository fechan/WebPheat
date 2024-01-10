import RawPhoibleData from "./RawPhoibleData.mjs";

class FeaturalSpecifications {
  #featSpecsDict;
  #featSpecsBytes;

  /**
   * 
   * @param {RawPhoibleData} rawPhoibleData 
   * @param {Object} featureMatrix
   */
  constructor(rawPhoibleData, { featSpecsDict, featSpecsBytes }={}) {
    if (featSpecsDict === undefined && featSpecsBytes === undefined) {
      throw new Error("Either featSpecsDict and/or featSpecsBytes must be defined when initializing FeaturalSpecifications");
    }

    this.rawPhoibleData = rawPhoibleData;

    this.#featSpecsDict = featSpecsDict;
    this.#featSpecsBytes = featSpecsBytes;
  }

  getDict() {
    if (this.#featSpecsDict === undefined) {
      this.#featSpecsDict = this.rawPhoibleData.decodeFeatSpecsBytes(this.#featSpecsBytes);
    }
    return this.#featSpecsDict;
  }

  /**
   * Get the featural specifications as bytes
   * @returns {Uint8Array}
   */
  getBytes() {
    if (this.#featSpecsBytes === undefined) {
      this.#featSpecsBytes = this.rawPhoibleData.encodeFeatSpecsDict(this.#featSpecsDict);
    }
    return this.#featSpecsBytes;
  }

  /**
   * Equality function against another segment's featural specifications
   * @param {FeaturalSpecifications} otherFeatSpecs Featural specifications to compare against
   * @returns {Boolean} True if they're both equal
   */
  is(otherFeatSpecs) {
    return this.cmp(otherFeatSpecs) === 0;
  }

  /**
   * Comparator function against another segment's featural specifications
   * 
   * This is for determining sort order in the rawPhoibleData only, since you
   * can't really have a segment that's (objectively) greater than another.
   * @param {FeaturalSpecifications} otherFeatSpecs Featural specifications to compare against
   * @returns {Number} Negative if this is less than other, positive if greater, 0 if equal
   */
  cmp(otherFeatSpecs) {
    const otherBytes = otherFeatSpecs.getBytes();
    for (let [i, value] of this.getBytes().entries()) {
      let difference = otherBytes[i] - value;
      if (difference !== 0) {
        return difference;
      }
    }
    return 0;
  }
}

export default FeaturalSpecifications;