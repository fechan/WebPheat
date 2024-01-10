import FeaturalSpecifications from "./FeaturalSpecifications.mjs";
import RawPhoibleData from "./RawPhoibleData.mjs";

class Segment {
  // These fields are lazy-evaluated, so unless they were provided on
  // initialization, they're undefined until a class method wants to use them.
  // This is so it won't slow things down with lookups against the Phoible data
  // if a large number of segments are needed.
  // A field can be defined but null if it's invalid:
  // (e.g. featSpec that is not attested and has no IPA)
  #ipa;
  #featSpecs;

  /**
   * A phonetic segment (phoneme or allophone)
   * 
   * Either its IPA or featural specification must be supplied on initialization
   * 
   * @param {RawPhoibleData} rawPhoibleData 
   * @param {Object} identifier
   * @param {String} identifier.ipa
   * @param {FeaturalSpecifications} identifier.featSpecs
   */
  constructor(rawPhoibleData, { ipa, featSpecs}={}) {
    if (ipa === undefined && featSpecs === undefined) {
      throw Error("ipa and/or featSpec must be supplied when constructing a Segment");
    }
    this.#ipa = ipa;
    this.#featSpecs = featSpecs;

    this.rawPhoibleData = rawPhoibleData;
  }

  /**
   * Get the featural specifications of this segment
   * @returns {FeaturalSpecifications} This segment's featural specifications
   */
  getFeatSpecs() {
    if (this.#featSpecs === undefined) { // either ipa or featSpec is defined at all times
      this.#featSpecs = this.rawPhoibleData.findSpecsByIpa(this.#ipa);
    }
    return this.#featSpecs;
  }

  /**
   * Get the IPA of this segment
   * @returns {String} This segment's IPA
   */
  getIpa() {
    if (this.#ipa === undefined) { // either ipa or featSpec is defined at all times
      this.#ipa = this.rawPhoibleData.findIpaByFeatSpecs(this.#featSpecs);
    }
    return this.#ipa;
  }

  /**
   * Transform the segment using partial featural specifications dict
   * @param {Object} partialFeatSpecsDict Partial featural specifications dict
   * @returns {Segment} Transformed segment with new featural specifications applied
   */
  transform(partialFeatSpecsDict) {
    const myFeatSpecsDict = this.getFeatSpecs().getDict();
    const newFeatSpecs = new FeaturalSpecifications(
      this.rawPhoibleData,
      { featSpecsDict: {...myFeatSpecsDict, ...partialFeatSpecsDict} }
    );
    return new Segment(this.rawPhoibleData, { featSpecs: newFeatSpecs });
  }

  toString() {
    return this.getIpa();
  }
}

export default Segment;