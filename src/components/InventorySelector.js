import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useState } from "react";

export default function InventorySelector({ onClose, inventories, dialects, onClickInventory }) {
  const [ searchTerm, setSearchTerm ] = useState("");
  const [ selectedLangIndex, setSelectedLangIndex ] = useState(0);
  
  const languages = Object.entries(inventories)
    .filter(([langName, langInvs]) => langName.toLowerCase().includes(searchTerm.toLowerCase()) )
    .sort((a, b) => {
      let [langNameA, langInvsA] = a;
      let [langNameB, langInvsB] = b;
      return langNameA.localeCompare(langNameB);
    });
  const selectedLanguage = languages[selectedLangIndex];

  const [ selectedInvId, setSelectedInvId ] = useState(selectedLanguage && Object.keys(selectedLanguage[1])[0]);
  
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
      key={ invId }
      className={ "p-2 hover:bg-gray-100 " + ( isSelected && "!bg-blue-100")}
      onClick={ () => setSelectedInvId(invId) }
    >
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-bold">Inventory { invId }: { dialects[invId] || selectedLanguage[0] }</span>
          {
            isSelected && <span>
              <a
                className="text-blue-700 hover:text-blue-500 text-right block"
                href={"https://phoible.org/inventories/view/" + invId}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Phoible →
              </a>
            </span>
          }
        </div>
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
          <h2 className="text-xl font-bold">Load an inventory from a language</h2>
          <button
            onClick={ onClose }
            className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-4 flex flex-col w-full h-full overflow-y-auto">
          <label className="mb-3">
            Search
            <input
              className="bg-gray-50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full rounded-md h-10 p-3"
              onChange={ e => setSearchTerm(e.target.value) }
            >
            </input>
          </label>
          
          <section className="grid grid-cols-2 gap-3 h-full">
            <div className="flex w-full flex-col">
              <h3 className="text-xl font-bold mb-4">Language</h3>
              <div className="p-2 w-full h-full border">
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
              <ul className="p-3 border rounded-sm h-full">
                { Object.entries(selectedLanguage ? selectedLanguage[1] : []).map(Inventory) }
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}