import {
  IWithSlug,
  IWithLayout,
  IWithPermissions,
  IWithCatalog,
} from "../traits";
import {} from "../traits/IWithCatalog";
import { IHubItemEntity } from "./IHubItemEntity";

/**
 * DRAFT: Under development and more properties will likely be added
 * @internal
 */
export interface IHubInitiative
  extends IHubItemEntity,
    IWithSlug,
    IWithCatalog,
    IWithPermissions {}
