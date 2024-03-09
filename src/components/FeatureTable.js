import { FixedSizeGrid as Grid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useRef, useState } from 'react';

/**
 * A table of distinctive features for the phonemes in a given inventory
 * @param {Object} props React props
 * @param {String[]} props.features List of features to show
 * @param {Object} props.inventory A phonemic inventory, which may be a result of a transformation due to a phonetic rule
 * @param {Object} [props.initialInventory] The phonemic inventory corresponding to `inventory` before transformation. Null if there is no transformation
 * @param {Object} [props.ruleTransformation] The transformation part of a phonetic rule. Maps transformed feature names to their new values
 * @returns Feature table
 */
export default function FeatureTable({ features, inventory, initialInventory, ruleTransformation }) {
  let [ hoverRow, setHoverRow ] = useState(null);

  let segments = inventory?.segments ?? [];
  segments = segments.filter(seg => seg.getFeatSpecs());
  let initialSegments = initialInventory?.segments;

  let featuresSorted = features.toSorted()

  function FeatureValueCell({ columnIndex, rowIndex, style }) {
    const featureName = featuresSorted[columnIndex];
    const featureValue = segments[rowIndex].getFeatSpecs().getDict()[featureName];
    const isZero = featureValue === "0";
    return <div
      style={ style }
      className={ "feature-cell border-e flex items-center justify-center " +
        (featureValue?.length > 4 ? "" : "text-xl ") +
        (isZero ? "text-gray-300 " : "") +
        ((hoverRow === rowIndex) ? "bg-blue-50 " : "") +
        ((featureName in ruleTransformation) ? "!bg-yellow-200 " : "")
      }
      onMouseOver={ () => setHoverRow(rowIndex) }
      onMouseOut={ () => setHoverRow(null) }
    >
      <span>{ featureValue?.replaceAll("-", "−") /* replaces dashes with minus sign */ }</span>
    </div>
  }

  function PhonemeCell({ index, style }) {
    const ipa = segments[index].getIpa();
    return <div
      style={ style }
      className={ "feature-cell text-2xl border-e flex items-center justify-center " +
        ((hoverRow === index) ? "bg-blue-50 " : "") +
        (ipa ? "" : "!bg-red-200 ")
      }
      onMouseOver={ () => setHoverRow(index) }
      onMouseOut={ () => setHoverRow(null) }
    >
      <span>
        { ( initialSegments && initialSegments[index].getIpa() ) }
        { initialSegments && <span className="mx-1 text-sm">→</span> }
        { ipa ?? "?" }
      </span>
    </div>
  }

  function FeatureColHeader({ index, style }) {
    return <div
      className="border-b p-2 flex items-end justify-center"
      style={ style }
    >
        <span>{ featuresSorted[index].replace(/([A-Z])/g, ' $1').toLowerCase() }</span>
    </div>
  }

  const featureHeaderRef = useRef(null);
  const phonemeColRef = useRef(null);
  const featMatrixRef = useRef(null);

  return (
    <div className="flex flex-auto">
      <div className="grid [grid-template-rows:80px_1fr]">
        <div className="[width:150px] [height:80px] border-b border-e p-2 flex items-end justify-center">
          <span>phoneme</span>
        </div>

        <div>
          <AutoSizer disableWidth>
            {({height})=>(<List
              className="[scrollbar-width:none]"
              ref={ phonemeColRef }
              width={ 150 }
              height={ height }
              itemCount={ segments.length }
              itemSize={ 45 }
              onScroll={({ scrollOffset }) => {
                if (featMatrixRef.current)
                  featMatrixRef.current.scrollTo({scrollTop: scrollOffset});
              }}
            >
              { PhonemeCell }
            </List>)}
          </AutoSizer>
        </div>
      </div>
      
      <div className="flex flex-col flex-auto">
        <div>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                className="[scrollbar-width:none]"
                ref={ featureHeaderRef }
                width={ width }
                height={ 80 }
                itemCount={ features.length }
                itemSize={ 100 }
                layout="horizontal"
                onScroll={({ scrollOffset }) => {
                  if (featMatrixRef.current)
                    featMatrixRef.current.scrollTo({scrollLeft: scrollOffset});
                }}
              >
                { FeatureColHeader }
              </List>
            )}
          </AutoSizer>
        </div>

        <div className="flex-auto">
          <AutoSizer>
            {({ height, width }) => (
              <Grid
                ref={ featMatrixRef }
                width={ width }
                height={ height }
                columnCount={ features.length }
                rowCount={ segments.length }
                rowHeight={ 45 }
                columnWidth={ 100 }
                onScroll={({ scrollLeft, scrollTop }) => {
                  if (featureHeaderRef.current)
                    featureHeaderRef.current.scrollTo(scrollLeft);
                  if (phonemeColRef.current)
                    phonemeColRef.current.scrollTo(scrollTop);
                }}
              >
                { FeatureValueCell }
              </Grid>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}