export interface SearchQuery {
  searchString: string | undefined;
  sort?: string[];
  filter?: string;
}

export const createDefaultSearchQuery = () => {
  return {
    searchString: "",
  };
};
