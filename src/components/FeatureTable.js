import { VariableSizeGrid as Grid, FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useRef } from 'react';

export default function FeatureTable({ features, inventory, initialInventory, ruleTransformation }) {
  let segments = inventory?.segments ?? [];
  segments = segments.filter(seg => seg.getFeatSpecs());
  let initialSegments = initialInventory?.segments;

  function Cell({ columnIndex, rowIndex, style }) {
    const featureName = features[columnIndex];
    const featureValue = segments[rowIndex].getFeatSpecs().getDict()[featureName];
    const isZero = featureValue === "0";
    return <div
      style={ style }
      className={ "feature-cell  " +
        (isZero ? "text-gray-300" : "") +
        ((featureName in ruleTransformation) ? "bg-yellow-200" : "")
      }
    >
      { featureValue }
    </div>
  }

  function PhonemeRow({ index, style }) {
    return <div style={ style } className="feature-cell text-2xl">
      { ( initialSegments && initialSegments[index].getIpa() ) }
      { initialSegments && <span className="mx-1">➜</span> }
      { segments[index].getIpa() ?? "?" }
    </div>
  }

  function FeatureColHeader({ index, style }) {
    return <div
      className="border-b p-2 flex items-end justify-center"
      style={ style }
    >
        <span>{ features[index].replace(/([A-Z])/g, ' $1').toLowerCase() }</span>
    </div>
  }
  const rowHeight = (row) => 45;
  const columnWidth = (col) => 100;

  const featureHeaderRef = useRef(null);
  const phonemeColRef = useRef(null);

  return (
    <div className="flex flex-auto">
      <div className="grid [grid-template-rows:80px_1fr]">
        <div className="[width:150px] [height:80px]">phoneme</div>
        <div>
          <AutoSizer disableWidth>
            {({height})=>(<FixedSizeList
              ref={ phonemeColRef }
              width={ 150 }
              height={ height }
              itemCount={ segments.length }
              itemSize={ 45 }
            >
              { PhonemeRow }
            </FixedSizeList>)}
          </AutoSizer>
        </div>
      </div>
      
      <div className="flex flex-col flex-auto">
        <div>
          <AutoSizer disableHeight>
            {({ width }) => (
              <FixedSizeList
                ref={ featureHeaderRef }
                width={ width }
                height={ 80 }
                itemCount={ features.length }
                itemSize={ 100 }
                layout="horizontal"
              >
                { FeatureColHeader }
              </FixedSizeList>
            )}
          </AutoSizer>
        </div>
        <div className="flex-auto">
          <AutoSizer>
            {({ height, width }) => (
              <Grid
                width={ width }
                height={ height }
                columnCount={ features.length }
                rowCount={ segments.length }
                rowHeight={ rowHeight }
                columnWidth={ columnWidth }
                onScroll={({ scrollLeft, scrollTop }) => {
                  if (featureHeaderRef.current)
                    featureHeaderRef.current.scrollTo(scrollLeft);
                  if (phonemeColRef.current)
                    phonemeColRef.current.scrollTo(scrollTop);
                }}
              >
                { Cell }
              </Grid>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
}