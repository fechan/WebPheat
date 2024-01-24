import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useState } from "react";

export default function InventorySelector({ show, onClose, inventories, dialects, onClickInventory }) {
  const [ selectedLangIndex, setSelectedLangIndex ] = useState(0);
  const [ selectedInvId, setSelectedInvId ] = useState();

  if (!show) return <></>;
  
  const languages = Object.entries(inventories)
    .sort((a, b) => {
      let [langNameA, langInvsA] = a;
      let [langNameB, langInvsB] = b;
      return langNameA.localeCompare(langNameB);
    });
  const selectedLanguage = languages[selectedLangIndex];
  
  function Language({ index, style }) {
    const onClick = () => {
      setSelectedLangIndex(index);
      setSelectedInvId(Object.keys(languages[index][1])[0])
    };

    return <div
      key={ index }
      style={ style }
      onClick={ onClick }
      className={ "p-2 hover:bg-gray-100 " + (index === selectedLangIndex && "!bg-blue-100") }
    >
      { languages[index][0] }
    </div>
  }

  function Inventory([invId, phonemes]) {
    const isSelected = invId === selectedInvId;

    const onClickLoadInventory = () => {
      onClickInventory(phonemes);
      onClose();
    }

    return <li
      className={ "p-2 hover:bg-gray-100 " + ( isSelected && "!bg-blue-100")}
      onClick={ () => setSelectedInvId(invId) }
    >
      <div>
        <div className="font-bold">Inventory { invId }: { dialects[invId] || selectedLanguage[0] }</div>
        <p className="text-gray-500">{ isSelected && phonemes }</p>
      </div>

      {
        isSelected && <button
          className="w-full my-2 p-2 text-white bg-blue-600 hover:bg-blue-500 focus:ring-2 rounded-md"
          onClick={ onClickLoadInventory }
        >
          Load inventory
        </button>
      }
    </li>
  }

  return (
    <div className="text-start fixed left-0 top-0 z-[1055] h-full w-full overflow-x-hidden outline-none flex items-center justify-center bg-black/50">
      <div className="bg-white w-9/12 h-5/6 flex flex-col ">
        <header className="p-4 flex justify-between border-b">
          <h2 class="text-xl font-bold">Load an inventory from a language</h2>
          <button
            onClick={ onClose }
            className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main class="p-4 grid grid-cols-2 w-full h-full gap-3">
          <div className="flex w-full flex-col">
            <h3 className="text-xl font-bold mb-4">Language</h3>
            <div class="p-2 w-full h-full border">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={ height }
                    width={ width }
                    itemCount={ languages.length }
                    itemSize={ 40 }
                  >
                    { Language }
                  </List>
                )}
              </AutoSizer>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Inventory</h3>
            <ul class="p-3 border rounded-sm h-full">
              { Object.entries(selectedLanguage[1]).map(Inventory) }
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}