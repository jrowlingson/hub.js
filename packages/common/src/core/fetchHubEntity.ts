import { fetchInitiative } from "../initiatives/HubInitiatives";
import { fetchProject } from "../projects/fetch";
import { fetchSite } from "../sites/HubSites";
import { HubEntity } from "./types/HubEntity";
import { HubEntityType } from "./types/HubEntityType";
import { IArcGISContext } from "../ArcGISContext";
import { fetchDiscussion } from "../discussions/fetch";

/**
 * Fetch a Hub entity by identifier (id or slug)
 * @param type
 * @param identifier
 * @param context
 * @returns
 */
export async function fetchHubEntity(
  type: HubEntityType,
  identifier: string,
  context: IArcGISContext
): Promise<HubEntity> {
  let result: HubEntity;
  switch (type) {
    case "project":
      result = await fetchProject(identifier, context.requestOptions);
      break;
    case "site":
      result = await fetchSite(identifier, context.hubRequestOptions);
      break;
    case "initiative":
      result = await fetchInitiative(identifier, context.requestOptions);
      break;
    case "discussion":
      result = await fetchDiscussion(identifier, context.hubRequestOptions);
      break;
    case "page":
      throw new Error(`FetchPage not implemented`);
  }
  return result;
}
