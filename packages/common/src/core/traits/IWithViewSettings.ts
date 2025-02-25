import { IHubTimeline } from "../types";

/**
 * Properties to be exclusively displayed on an entity's
 * pre-defined view
 */
export interface IWithViewSettings {
  /**
   * array of contacts associated with an entity. Contact interface TBD
   */
  contacts?: any[];
  /**
   * array of entity's featured content ids to be rendered in a gallery
   */
  featuredContentIds?: string[];
  /**
   * entity's featured image url
   */
  featuredImageUrl?: string;
  /**
   * whether the entity should render it's location on a map
   */
  showMap?: boolean;
  /**
   * timeline associated with an entity
   */
  timeline?: IHubTimeline;
}
