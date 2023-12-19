import { poetriesIndex } from "./poetries";

export default defineEventHandler(async () => {
  const res = await poetriesIndex.searchForFacetValues({
    facetName: "library",
  });
  return res.facetHits;
});
