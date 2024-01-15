import { FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

export default function({ features, inventory, initialInventory }) {
  let segments = inventory?.segments ?? [];
  segments = segments.filter(seg => seg.getFeatSpecs());
  let initialSegments = initialInventory?.segments;

  function Row({ index, style }) {
    const s = segments[index];

    if ( index === 0 ) {
      return (
        <div style={ style }>
          <div>Phoneme</div>
          { features.map(f => <div key={ f }>{ f }</div>) }
        </div>
      )
    }

    return (
      <div style={ style }>
        <div>
          { initialSegments && initialSegments[index].getIpa() + " ➜ " }
          { s.getIpa() || "?" }
        </div>
        {
          Object.values(s.getFeatSpecs().getDict()).map(v => <div>
            { v === '0' ? ' ' : v}
          </div>)
        }
      </div>
    )
  }

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          width={ width }
          height={ height }
          itemCount={ segments.length }
          itemSize={ 45 }
        >
          { Row }
        </List>
      )}
    </AutoSizer>
  );

  // return (
  //   <table>
  //     <thead><tr>
  //       <td>Phoneme</td>
  //       { features.map(f => <td key={ f }>{ f }</td>) }</tr>
  //     </thead>
  //     <tbody>
  //       {
  //         segments
  //           .filter(s => s.getFeatSpecs())
  //           .map((s, i) => <tr key={ i }>
  //             <td>
  //               { initialSegments && initialSegments[i].getIpa() + " ➜ " }
  //               { s.getIpa() || "?" }
  //             </td>
              
  //             { Object.values(s.getFeatSpecs().getDict()).map(v => <td>
  //               { v === '0' ? ' ' : v}
  //             </td>) }
  //           </tr>)
  //       }
  //     </tbody>
  //   </table>
  // );
}