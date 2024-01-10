import FeaturalSpecifications from "./FeaturalSpecifications.mjs";

class RawPhoibleData {
  /**
   * Wrapper for accessing the compressed Phoible data
   * @param {Uint8Array} rawData 
   * @param {*} metadata 
   */
  constructor(rawData, metadata) {
    this.rawData = rawData;

    this.features = metadata.features;
    this.featureValues = metadata.featureValues;
    this.segmentsIpa = metadata.phonemes;
  }

  /**
   * Find featural specifications for the list of segments in IPA.
   * 
   * This is generally faster than calling findSpecsByIPA individually for
   * every element.
   * 
   * @param {String[]} segmentsToLookup List of IPA segments to find specifications for
   * @return {FeaturalSpecifications[]} Featural specifications for each IPA in the input
   */
  findSpecsInArrayIpa(segmentsToLookup) {
    let specifications = Array(segmentsToLookup.length());

    // loop through allSegments because it's usually way larger than segmentsToLookup
    // and we only have to loop through segmentsIpa once
    for (let [globalIndex, segment] of this.segmentsIpa.entries()) {
      let inputIndex = segmentsToLookup.indexOf(segment);
      if (inputIndex !== -1) {
        specifications[inputIndex] = this.findSpecsByIndex(globalIndex);
      } else {
        specifications[inputIndex] = null;
      }
    }
    
    return specifications;
  }

  /**
   * Find featural specifications for a segment by its order in the raw data
   * @param {Number} index Order the segment appears in (e.g. 3 if it's the 3rd segment in the data)
   * @returns {FeaturalSpecifications} Featural specifications
   */
  findSpecsByIndex(index) {
    const phonemeStart = this.features.length * index;
    const phonemeEnd = phonemeStart + this.features.length;

    return new FeaturalSpecifications(this, {
      featSpecsBytes: this.rawData.slice(phonemeStart, phonemeEnd)
    });
  }

  /**
   * Find featural specifications for a segment by its IPA
   * 
   * If you want specifications for a lot of segments, use `findSpecsInArrayIpa`
   * instead
   * 
   * @param {String} ipa IPA of segment to lookup
   * @returns {FeaturalSpecifications} Featural specifications
   */
  findSpecsByIpa(ipa) {
    const index = this.segmentsIpa.indexOf(ipa);
    if (index === -1) return null;
    return this.findSpecsByIndex(index);
  }

  /**
   * Find the IPA for the given featural specifications
   * @param {FeaturalSpecifications} featSpecs 
   * @returns {String} Corresponding IPA
   */
  findIpaByFeatSpecs(featSpecs) {
    let searchRangeLower = 0;
    let searchRangeUpper = this.segmentsIpa.length - 1;

    while (searchRangeLower < searchRangeUpper) {
      let searchAt = Math.floor((searchRangeLower + searchRangeUpper) / 2);
      let foundFeatSpecs = this.findSpecsByIndex(searchAt);

      let comparison = featSpecs.cmp(foundFeatSpecs);
      if (comparison < 0) {
        searchRangeLower = searchAt + 1;
      } else if (comparison > 0) {
        searchRangeUpper = searchAt - 1;
      } else {
        let utf8 = new TextEncoder("utf-8");
        // get the IPA with the fewest diacritics with the same feat spec
        return this.#findIpaWithSameSpecs(searchAt).reduce(
          (best, current) => utf8.encode(best).length < utf8.encode(current).length ? best : current
        );
      }
    }

    return null;
  }

  /**
   * Find IPA with the same featural specifications as the segment at the given
   * index
   * 
   * According to linguistic theory, IPA and feat specs should be 1-to-1, but
   * PHOIBLE isn't perfect
   * @param {Number} index Order the segment
   * @returns {String[]} List of matching IPA by featural specifications
   */
  #findIpaWithSameSpecs(index) {
    let ipas = [this.segmentsIpa[index]];
    let inputFeatSpecs = this.findSpecsByIndex(index)

    // search lower indices first
    for (let i=index; i > -1; i--) {
      let otherFeatSpecs = this.findSpecsByIndex(i);
      if (otherFeatSpecs.equal(inputFeatSpecs)) {
        ipas.push(this.segmentsIpa[i]);
      }
    }

    // search higher indices
    for (let i=index; i < this.segmentsIpa.length; i++) {
      let otherFeatSpecs = this.findSpecsByIndex(i);
      if (otherFeatSpecs.equal(inputFeatSpecs)) {
        ipas.push(this.segmentsIpa[i]);
      }
    }

    return ipas;
  }

  /**
   * Decode featural specifications in byte form to dict form
   * @param {Uint8Array} bytes Raw featural specifications
   * @returns {Object} Featural specifications object mapping feature names to values
   */
  decodeFeatSpecsBytes(bytes) {
    const dict = {}
    for (let [featIdx, feature] of this.features.entries()) {
      dict[feature] = this.featureValues[bytes[featIdx]];
    }
    return dict;
  }
    
  /**
   * Encode featural specifications in dict form as byte form
   * @param {Object} dict Featural specifications in dict form
   * @returns {Uint8Array} Featural specifications in byte form
   */
  encodeFeatSpecsDict(dict) {
    const buf = new ArrayBuffer(this.features.length);
    const encoded = new Uint8Array(buf);
    for (let [featIdx, feature] of this.features.entries()) {
      encoded[featIdx] = this.featureValues.indexOf(dict[feature]);
    }
    return encoded;
  }
}

export default RawPhoibleData;