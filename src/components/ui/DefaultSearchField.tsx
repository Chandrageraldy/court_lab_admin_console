import { Search } from "lucide-react";

interface SearchFieldProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
  handleSearch: () => void;
  fullWidth?: boolean;
  placeholder?: string;
}

const DefaultSearchField = ({
  searchValue,
  setSearchValue,
  handleSearch,
  fullWidth = false,
  placeholder = "Search...",
}: SearchFieldProps) => {
  return (
    <div className={`flex ${fullWidth ? "w-full" : ""}`}>
      <div className={`relative ${fullWidth ? "w-full" : "w-64"}`}>
        <input
          type="text"
          className="w-full bg-white px-4 py-1.5 pr-10 border border-gray-300 outline-none focus:border-2 focus:border-[#F14B27] rounded-lg text-[13px]"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
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
