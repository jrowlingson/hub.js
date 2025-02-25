import { IUserRequestOptions } from "@esri/arcgis-rest-auth";
import { IItem, IUserItemOptions, removeItem } from "@esri/arcgis-rest-portal";
import { getFamily } from "../content/get-family";
import { fetchSiteModel } from "./fetchSiteModel";
import { PropertyMapper } from "../core/_internal/PropertyMapper";
import { handleDomainChanges } from "./_internal";
import { IRequestOptions } from "@esri/arcgis-rest-request";
import { fetchItemEnrichments } from "../items/_enrichments";
import { parseInclude } from "../search/_internal/parseInclude";
import { getHubRelativeUrl } from "../content/_internal";
import { applyPermissionMigration } from "./_internal/applyPermissionMigration";
import { computeProps } from "./_internal/computeProps";
import { getPropertyMap } from "./_internal/getPropertyMap";
import { IHubSite } from "../core/types/IHubSite";
import { constructSlug, setSlugKeyword } from "../items/slugs";
import { slugify } from "../utils/slugify";
import { ensureUniqueDomainName } from "./domains/ensure-unique-domain-name";
import { stripProtocol } from "../urls/strip-protocol";
import { getHubApiUrl } from "../api";
import { getOrgDefaultTheme } from "./themes";
import { cloneObject, unique } from "../util";
import {
  createModel,
  fetchModelFromItem,
  getModel,
  updateModel,
} from "../models";
import { registerSiteAsApplication } from "./registerSiteAsApplication";
import { addSiteDomains } from "./domains/addSiteDomains";
import { IHubRequestOptions, IModel } from "../types";
import { removeDomainsBySiteId } from "./domains/remove-domains-by-site-id";
import { IHubSearchResult } from "../search/types/IHubSearchResult";
import { mapBy } from "../utils";
import { getProp, setProp } from "../objects";
import { getItemThumbnailUrl } from "../resources/get-item-thumbnail-url";

export const HUB_SITE_ITEM_TYPE = "Hub Site Application";
export const ENTERPRISE_SITE_ITEM_TYPE = "Site Application";

/**
 * Default values of a IHubSite
 */
const DEFAULT_SITE: Partial<IHubSite> = {
  name: "No title provided",
  tags: [],
  typeKeywords: ["Hub Site", "hubSite", "DELETEMESITE"],
  classicCapabilities: [
    "api_explorer",
    "pages",
    "my_data",
    "social_logins",
    "json_chart_card",
    "document_iframes",
    "items_view",
    "app_page",
    "underlinedLinks",
    "globalNav",
    "socialSharing",
  ],
  catalog: {
    schemaVersion: 1,
  },
  subdomain: "",
  defaultHostname: "",
  customHostname: "",
  clientId: "",
  map: null,
  feeds: {},
  pages: [],
  theme: null,
  contentViews: {
    sidePanelOpen: {
      app: true,
      map: true,
      dataset: true,
      document: true,
      feedback: true,
    },
  },
};

/**
 * Default values for a new HubSite Model
 */
const DEFAULT_SITE_MODEL: IModel = {
  item: {
    // type: intentionally left out as we need to
    // set that based on portal/enterprise
    title: "No Title Provided",
    description: "No Description Provided",
    snippet: "",
    tags: [],
    typeKeywords: ["Hub Site", "hubSite", "DELETEMESITE"],
    properties: {
      slug: "",
      orgUrlKey: "",
      defaultHostname: "",
      customHostname: "",
      clientId: "",
      subdomain: "",
      schemaVersion: 1.5,
    },
    url: "",
  } as IItem,
  data: {
    catalog: {
      groups: [],
    },
    feeds: {},
    values: {
      title: "",
      defaultHostname: "",
      customHostname: "",
      subdomain: "",
      faviconUrl: "",
      uiVersion: "2.4",
      clientId: "",
      map: {
        basemaps: {},
      },
      defaultExtent: {},
      pages: [],
      theme: {},
      layout: {
        sections: [],
        header: {
          component: {
            name: "site-header",
            settings: {
              fullWidth: false,
              iframeHeight: "150px",
              iframeUrl: "",
              links: [],
              logoUrl: "",
              title: "default site",
              markdown: "",
              headerType: "default",
              schemaVersion: 3,
              showLogo: true,
              showTitle: true,
              logo: {
                display: {},
                state: "valid",
              },
              shortTitle: "",
              menuLinks: [],
              socialLinks: {
                facebook: {},
                twitter: {},
                instagram: {},
                youtube: {},
              },
            },
          },
          showEditor: false,
        },
        footer: {
          component: {
            name: "site-footer",
            settings: {
              footerType: "none",
              markdown: "",
              schemaVersion: 2.1,
            },
          },
          showEditor: false,
        },
      },
      contentViews: {
        sidePanelOpen: {
          app: true,
          map: true,
          dataset: true,
          document: true,
          feedback: true,
        },
      },
    },
  },
};

// TODO: Add OperationStack & Error Handling

/**
 * Create a new Hub Site
 *
 * Minimum properties are `name` and `org`
 * @param partialSite
 * @param requestOptions
 */
export async function createSite(
  partialSite: Partial<IHubSite>,
  requestOptions: IHubRequestOptions
): Promise<IHubSite> {
  const site = { ...DEFAULT_SITE, ...partialSite };
  const portal = requestOptions.portalSelf;
  // Set the type based on the environment we are working in
  site.type = requestOptions.isPortal
    ? ENTERPRISE_SITE_ITEM_TYPE
    : HUB_SITE_ITEM_TYPE;
  // Create a slug from the title if one is not passed in
  if (!site.slug) {
    site.slug = constructSlug(site.name, site.orgUrlKey);
  }
  // Ensure slug is  unique
  // site.slug = await getUniqueSlug({ slug: site.slug }, requestOptions);
  // add slug to keywords
  site.typeKeywords = setSlugKeyword(site.typeKeywords, site.slug);

  if (!site.subdomain) {
    site.subdomain = slugify(site.name);
  }

  site.subdomain = await ensureUniqueDomainName(site.subdomain, requestOptions);

  // Domains
  if (!requestOptions.isPortal) {
    // now that we know the subdomain is available, set the defaultHostname
    site.defaultHostname = `${site.subdomain}-${portal.urlKey}.${stripProtocol(
      getHubApiUrl(requestOptions)
    )}`;

    // set the url
    site.url = `https://${
      site.customHostname ? site.customHostname : site.defaultHostname
    }`;
  } else {
    // Portal Sites use subdomain in hash based router
    site.typeKeywords.push(`hubsubdomain|${site.subdomain}`.toLowerCase());
    site.url = `${requestOptions.authentication.portal.replace(
      `/sharing/rest`,
      `/apps/sites`
    )}/#/${site.subdomain}`;
  }

  // Note:  We used to use adlib for this, but it's much harder to
  // use templates with typescript. i.e. you can't assign a string template
  // to a property defined as `IExtent` without using `as unknown as ...`
  // which basically removes typechecking

  site.orgUrlKey = portal.urlKey;

  // override only if not set...
  if (!site.theme) {
    site.theme = getOrgDefaultTheme(portal);
  }

  if (!site.defaultExtent) {
    site.defaultExtent = portal.defaultExtent;
  }

  if (!site.culture) {
    site.culture = portal.culture;
  }
  // pull the basemap from portalSelf
  if (!getProp(site, "map.basemaps.primary")) {
    setProp("map.basemaps.primary", portal.defaultBasemap, site);
  }
  // Put the title into the header
  if (!getProp(site, "layout.header.component.settings.title")) {
    setProp("layout.header.component.settings.title", site.name, site);
  }

  // Now convert the IHubSite into an IModel
  const mapper = new PropertyMapper<Partial<IHubSite>>(getPropertyMap());
  let model = mapper.objectToModel(site, cloneObject(DEFAULT_SITE_MODEL));
  // create the backing item
  model = await createModel(
    model,
    requestOptions as unknown as IUserRequestOptions
  );

  // Register as an app
  const registration = await registerSiteAsApplication(model, requestOptions);
  model.data.values.clientId = registration.client_id;

  // Register domains
  await addSiteDomains(model, requestOptions);

  // update the model
  const updatedModel = await updateModel(
    model,
    requestOptions as unknown as IUserRequestOptions
  );

  // convert the model into a IHubSite and return
  return mapper.modelToObject(updatedModel, {}) as IHubSite;
}

/**
 * Update a Hub Site
 *
 * This checks for and applies domain changes
 * @param site
 * @param requestOptions
 * @returns
 */
export async function updateSite(
  site: IHubSite,
  requestOptions: IHubRequestOptions
): Promise<IHubSite> {
  // Most of this work is done with an IModel, so first thing it to
  // convert IHubSite to model
  const mapper = new PropertyMapper<IHubSite>(getPropertyMap());
  // applying the site onto the default model ensures that a minimum
  // set of properties exist, regardless what may have been done to
  // the site pojo
  const updatedModel = mapper.objectToModel(
    site,
    cloneObject(DEFAULT_SITE_MODEL)
  );
  // Fetch backing model from the portal
  const currentModel = await getModel(site.id, requestOptions);
  // handle any domain changes
  await handleDomainChanges(updatedModel, currentModel, requestOptions);

  if (updatedModel.item.properties.slug !== currentModel.item.properties.slug) {
    // ensure slug to keywords
    updatedModel.item.typeKeywords = setSlugKeyword(
      updatedModel.item.typeKeywords,
      updatedModel.item.properties.slug
    );
  }

  // merge the updated site onto the current model
  const modelToStore = mapper.objectToModel(site, currentModel);
  // update the model
  const updatedSiteModel = await updateModel(
    modelToStore,
    requestOptions as unknown as IUserItemOptions
  );
  // fetch updated model
  const updatedSite = mapper.modelToObject(updatedSiteModel, site);
  return updatedSite;
}

/**
 * @private
 * Remove a Hub Site
 *
 * This simply removes the Site item, and it's associated domain records.
 * This does not remove any Teams/Groups or content associated with the
 * Site
 * @param id
 * @param requestOptions
 * @returns
 */
export async function destroySite(
  id: string,
  requestOptions: IHubRequestOptions
): Promise<void> {
  // tslint:disable-next-line:no-console
  console.warn(`destroySite is deprecated, use deleteSite instead`);
  return deleteSite(id, requestOptions);
}

/**
 * Remove a Hub Site
 *
 * This simply removes the Site item, and it's associated domain records.
 * This does not remove any Teams/Groups or content associated with the
 * Site
 * @param id
 * @param requestOptions
 * @returns
 */
export async function deleteSite(
  id: string,
  requestOptions: IHubRequestOptions
): Promise<void> {
  // For AGO we need to remove the domain records for the site
  if (!requestOptions.isPortal) {
    await removeDomainsBySiteId(id, requestOptions);
  }
  // now we can remove the item
  const ro = { ...requestOptions, ...{ id } } as IUserItemOptions;
  await removeItem(ro);
  return;
}

/**
 * Returns site model given various kinds of identifier
 *
 * @param identifier - a site item ID, site hostname, enterprise site slug, or full site URL
 * @param requestOptions
 * @private // remove when we remove existing fetchSite function
 */
export async function fetchSite(
  identifier: string,
  requestOptions: IHubRequestOptions
): Promise<IHubSite> {
  // get the model
  const model = await fetchSiteModel(identifier, requestOptions);
  // convert to IHubSite
  return convertModelToSite(model, requestOptions);
}

/**
 * Convert an IModel for a Hub Site Item into an IHubSite
 * @param model
 * @param requestOptions
 * @returns
 */
export function convertModelToSite(
  model: IModel,
  requestOptions: IRequestOptions
): IHubSite {
  // Add permissions based on Groups
  // This may get moved to a formal schema migration in the future but for now
  // we can do it here as there is no ux for managing permissions yet.
  const modelWithPermissions = applyPermissionMigration(model);
  // convert to site
  const mapper = new PropertyMapper<Partial<IHubSite>>(getPropertyMap());
  const site = mapper.modelToObject(modelWithPermissions, {}) as IHubSite;
  // compute additional properties
  return computeProps(model, site, requestOptions);
}

/**
 * Convert a Hub Site Application item into a Hub Site, fetching any
 * additional information that may be required
 * @param item
 * @param auth
 * @returns
 */
export async function convertItemToSite(
  item: IItem,
  requestOptions: IRequestOptions
): Promise<IHubSite> {
  const model = await fetchModelFromItem(item, requestOptions);
  return convertModelToSite(model, requestOptions);
}

/**
 * Fetch Site specific enrichments
 * @param item
 * @param include
 * @param requestOptions
 * @returns
 */
export async function enrichSiteSearchResult(
  item: IItem,
  include: string[],
  requestOptions: IHubRequestOptions
): Promise<IHubSearchResult> {
  // Create the basic structure
  const result: IHubSearchResult = {
    access: item.access,
    id: item.id,
    type: item.type,
    name: item.title,
    owner: item.owner,
    typeKeywords: item.typeKeywords,
    tags: item.tags,
    categories: item.categories,
    summary: item.snippet || item.description,
    createdDate: new Date(item.created),
    createdDateSource: "item.created",
    updatedDate: new Date(item.modified),
    updatedDateSource: "item.modified",
    family: getFamily(item.type),
    links: {
      self: "not-implemented",
      siteRelative: "not-implemented",
      thumbnail: "not-implemented",
    },
  };

  // default includes
  const DEFAULTS: string[] = [];
  // merge includes
  include = [...DEFAULTS, ...include].filter(unique);
  // Parse the includes into a valid set of enrichments
  const specs = include.map(parseInclude);
  // Extract out the low-level enrichments needed
  const enrichments = mapBy("enrichment", specs).filter(unique);
  // fetch the enrichments
  let enriched = {};
  if (enrichments.length) {
    // TODO: Look into caching for the requests in fetchItemEnrichments
    enriched = await fetchItemEnrichments(item, enrichments, requestOptions);
  }

  // map the enriched props onto the result
  specs.forEach((spec) => {
    result[spec.prop] = getProp(enriched, spec.path);
  });

  // Handle links
  result.links.thumbnail = getItemThumbnailUrl(item, requestOptions);
  result.links.self = item.url;
  result.links.siteRelative = getHubRelativeUrl(
    result.type,
    result.id,
    item.typeKeywords
  );

  return result;
}
