export interface SearchQuery {
  searchString: string;
  sort?: string[];
  filter?: string;
}

export const createDefaultSearchQuery = () => {
  return {
    searchString: "",
  };
};
