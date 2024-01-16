import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

export default function({ features, inventory, initialInventory }) {
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
        <span>{ features[columnIndex - 1].replace(/([A-Z])/g, ' $1').toLowerCase() }</span>
      </div>
    }

    if (columnIndex === 0) {
      return <div style={ style }>
        { ( initialSegments && initialSegments[rowIndex - 1].getIpa() ) }
        { initialSegments && <span className="mx-1">➜</span> }
        { segments[rowIndex - 1].getIpa() ?? "?" }
      </div>
    }

    if (columnIndex > 0) {
      const featureValue = segments[rowIndex - 1].getFeatSpecs().getDict()[features[columnIndex - 1]];
      const isZero = featureValue === "0";
      return <div style={ style } className={ "border-s " + (isZero && "text-gray-300") }>
        { featureValue }
      </div>
    }
  }

  const rowHeight = (row) => row === 0 ? 45*1.75 : 45;
  const columnWidth = (col) => col === 0 ? 100*1.5 : 100;

  return (
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
        >
          { Cell }
        </Grid>
      )}
    </AutoSizer>
    </div>
  );
}