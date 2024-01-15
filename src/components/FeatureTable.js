import { VariableSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

export default function({ features, inventory, initialInventory }) {
  let segments = inventory?.segments ?? [];
  segments = segments.filter(seg => seg.getFeatSpecs());
  let initialSegments = initialInventory?.segments;

  function Row({ index, style }) {
    const s = segments[index];

    if ( index === 0 ) {
      return (
        <div style={ style } className="flex">
          <div class="w-10 overflow-hidden">
            <div class="-rotate-90 translate-y-16">Phoneme</div>
          </div>
          { features.map(f => <div class="w-10 overflow-hidden">
            <div key={ f } class="-rotate-90 translate-y-16">{ f }</div>
          </div>) }
        </div>
      )
    }

    return (
      <div style={ style } className="flex">
        <div class="w-8">
          { initialSegments && initialSegments[index - 1].getIpa() + " ➜ " }
          { s.getIpa() || "?" }
        </div>
        {
          Object.values(s.getFeatSpecs().getDict()).map(v => (
            <div class="w-8 border-x">
              { v === '0' ? '0' : v}
            </div>
          ))
        }
      </div>
    )
  }

  const getItemSize = index => index === 0 ? 100 : 45;

  return (
    <div style={{ flex: '1 1 auto' }}>
    <AutoSizer>
      {({ height, width }) => (
        <List
          width={ width }
          height={ height }
          itemCount={ segments.length }
          itemSize={ getItemSize }
        >
          { Row }
        </List>
      )}
    </AutoSizer>
    </div>
  );
}