// SearchDropdown tipleri — SearchBar.tsx içindeki SearchModal tarafından kullanılır.
// Ayrı bir Modal/overlay bileşeni artık gerekmez; tüm search UX SearchBar.tsx içindedir.

export interface SearchResult {
  query:             string;
  products:          { id: number; name: string; price: string; image: string | null; slug: string }[];
  experts:           { id: number; name: string; avatar: string | null; expertise: string; slug: string }[];
  services:          { id: string; label: string; desc: string; icon: string; route: string }[];
  autocomplete:      string | null;
  hasResults:        boolean;
  trending:          string[];
  popularCategories: { label: string; slug: string; icon: string }[];
  popularServices:   { id: string; label: string; desc: string; icon: string; route: string }[];
}
