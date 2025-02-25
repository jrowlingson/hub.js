import { IPropertyMap } from "../../core/_internal/PropertyMapper";
import { getBasePropertyMap } from "../../core/_internal/getBasePropertyMap";

/**
 * Returns an Array of IPropertyMap objects
 * We could define these directly, but since the
 * properties of IHubSite map directly to properties
 * on item or data, it's slightly less verbose to
 * generate the structure.
 * @returns
 */
export function getPropertyMap(): IPropertyMap[] {
  const map = getBasePropertyMap();
  // Site specific mappings
  map.push({ objectKey: "catalog", modelKey: "data.catalog" });
  map.push({ objectKey: "feeds", modelKey: "data.feeds" });
  map.push({ objectKey: "permissions", modelKey: "data.permissions" });
  map.push({
    objectKey: "capabilities",
    modelKey: "data.capabilities",
  });
  // Props stored below `data.values`
  const valueProps = [
    "pages",
    "theme",
    "subdomain",
    "defaultHostname",
    "customHostname",
    "clientId",
    "defaultExtent",
    "map",
    "telemetry",
    "headerSass",
    "headContent",
    "layout",
  ];
  valueProps.forEach((entry) => {
    map.push({ objectKey: entry, modelKey: `data.values.${entry}` });
  });
  // Deeper/Indirect mappings
  map.push({
    objectKey: "slug",
    modelKey: "item.properties.slug",
  });
  map.push({
    objectKey: "classicCapabilities",
    modelKey: "data.values.capabilities",
  });
  map.push({
    objectKey: "capabilities",
    modelKey: "data.settings.capabilities",
  });
  map.push({
    objectKey: "orgUrlKey",
    modelKey: "item.properties.orgUrlKey",
  });
  map.push({
    objectKey: "name",
    modelKey: "item.title",
  });

  return map;
}
