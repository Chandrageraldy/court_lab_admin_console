// ─────────────────────────────────────────────────────────
// DefaultSearchField — Search Input with Icon Button
//
// ✏️ PROPS:
//   searchValue    → controlled input value
//   setSearchValue → updates the controlled value
//   handleSearch   → triggered on Enter key or button click
//
// ✏️ USAGE:
//   const [query, setQuery] = useState('');
//
//   <DefaultSearchField
//     searchValue={query}
//     setSearchValue={setQuery}
//     handleSearch={() => fetchData(query)}
//   />
// ─────────────────────────────────────────────────────────

import { Search } from "lucide-react";

interface SearchFieldProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
}

const DefaultSearchField = ({
  searchValue,
  setSearchValue,
  handleSearch,
}: SearchFieldProps) => {
  return (
    <div className="flex">
      <div className="relative w-64">
        <input
          type="text"
          className="w-full bg-white px-4 py-1.5 pr-10 border border-gray-300 outline-none focus:ring-2 focus:ring-[#F14B27] focus:border-[#F14B27] rounded-lg text-[13px]"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            // Trigger search on Enter key
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DefaultSearchField;
