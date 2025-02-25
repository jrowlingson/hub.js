import { IQuery } from "../../types/IHubCatalog";
import { IHubSearchOptions } from "../../types/IHubSearchOptions";
import { IHubSearchResponse } from "../../types/IHubSearchResponse";
import { IHubSearchResult } from "../../types/IHubSearchResult";
import { IApiDefinition } from "../../types/types";
import { formatOgcAggregationsResponse } from "./formatOgcAggregationsResponse";
import { getOgcAggregationQueryParams } from "./getOgcAggregationQueryParams";
import { ogcApiRequest } from "./ogcApiRequest";

export async function searchOgcAggregations(
  query: IQuery,
  options: IHubSearchOptions
): Promise<IHubSearchResponse<IHubSearchResult>> {
  const apiDefinition = options.api as IApiDefinition;
  const url = `${apiDefinition.url}/aggregations`;
  const queryParams = getOgcAggregationQueryParams(query, options);

  const rawResponse = await ogcApiRequest(url, queryParams, options);

  return formatOgcAggregationsResponse(rawResponse);
}
