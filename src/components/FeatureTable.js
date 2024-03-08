import { VariableSizeGrid as Grid, FixedSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { useRef } from 'react';

export default function({ features, inventory, initialInventory, ruleTransformation }) {
  let segments = inventory?.segments ?? [];
  segments = segments.filter(seg => seg.getFeatSpecs());
  let initialSegments = initialInventory?.segments;

  function Cell({ columnIndex, rowIndex, style }) {
    if (rowIndex === 0 && columnIndex === 0) {
      return <div style={ style } className="border-b p-2 flex items-end justify-center">
        <span>phoneme</span>
      </div>
    }

    if (rowIndex === 0 && columnIndex > 0) {
      return <div style={ style } className="border-b p-2 flex items-end justify-center">
        <span>x { features[columnIndex - 1].replace(/([A-Z])/g, ' $1').toLowerCase() }</span>
      </div>
    }

    if (columnIndex === 0) {
      return <div style={ style } className="feature-cell text-2xl">
        { ( initialSegments && initialSegments[rowIndex - 1].getIpa() ) }
        { initialSegments && <span className="mx-1">➜</span> }
        { segments[rowIndex - 1].getIpa() ?? "?" }
      </div>
    }

    if (columnIndex > 0) {
      const featureName = features[columnIndex - 1];
      const featureValue = segments[rowIndex - 1].getFeatSpecs().getDict()[featureName];
      const isZero = featureValue === "0";
      return <div
        style={ style }
        className={ "feature-cell text-2xl border-s " +
          (isZero ? "text-gray-300" : "") +
          ((featureName in ruleTransformation) ? "bg-yellow-200" : "")
        }
      >
        { featureValue }
      </div>
    }
  }

  function FeatureColHeader({ index, style }) {
    return <div>
        <span style={ style }>{ features[index].replace(/([A-Z])/g, ' $1').toLowerCase() }</span>
    </div>
  }

  const rowHeight = (row) => row === 0 ? 45*1.75 : 45;
  const columnWidth = (col) => col === 0 ? 100*1.5 : 100;

  const featureHeaderRef = useRef(null);

  return (
    <div className="flex flex-col" style={{ flex: '1 1 auto' }}>
      <div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <FixedSizeList
              ref={featureHeaderRef}
              width={ width }
              height={ 45*1.75 }
              itemCount={ features.length }
              itemSize ={ 100 }
              layout="horizontal"
            >
              { FeatureColHeader }
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
      <div style={{ flex: '1 1 auto' }}>
        <AutoSizer>
          {({ height, width }) => (
            <Grid
              width={ width }
              height={ height }
              columnCount={ features.length + 1 }
              rowCount={ segments.length + 1 }
              rowHeight={ rowHeight }
              columnWidth={ columnWidth }
              onScroll={({ scrollLeft, scrollTop }) => {
                if (featureHeaderRef.current)
                  featureHeaderRef.current.scrollTo(scrollLeft);
              }}
            >
              { Cell }
            </Grid>
          )}
        </AutoSizer>
      </div>
    </div>
  );
}