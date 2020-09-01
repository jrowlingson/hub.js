/* Copyright (c) 2018 Environmental Systems Research Institute, Inc.
 * Apache-2.0 */

import { request } from "@esri/arcgis-rest-request";
import { IHubContent, IHubRequestOptions } from "@esri/hub-common";
import { getContentFromHub } from "./hub";
import { getContentFromPortal } from "./portal";
import { isSlug } from "./slugs";

/**
 * Fetch content using either the Hub API or the ArcGIS REST API
 * @param identifier Hub API slug ({orgKey}::{title-as-slug} or {title-as-slug})
 * or record id ((itemId}_{layerId} or {itemId})
 * @param requestOptions - request options that may include authentication
 */
export function getContent(
  identifier: string,
  requestOptions?: IHubRequestOptions
): Promise<IHubContent> {
  if (requestOptions && requestOptions.isPortal) {
    return getContentFromPortal(identifier, requestOptions);
  } else {
    return getContentFromHub(identifier, requestOptions).catch(e => {
      // dataset is not in index (i.e. might be a private item)
      if (!isSlug(identifier)) {
        // try fetching from portal instead
        return getContentFromPortal(identifier, requestOptions);
      }
      return Promise.reject(e);
    });
  }
}

// TODO: remove this next breaking version
/**
 * @returns not much
 * @restlink https://developers.arcgis.com/rest/
 */
export function comingSoon(): Promise<any> {
  return request("https://www.arcgis.com/sharing/rest/info");
}
