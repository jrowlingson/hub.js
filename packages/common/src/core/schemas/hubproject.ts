import { IConfigurationSchema, IUiSchema, UiSchemaRuleEffects } from "./types";
import { PROJECT_STATUSES } from "../types";

export const HubProjectSchema: IConfigurationSchema = {
  required: ["name"],
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 250,
    },
    summary: {
      type: "string",
    },
    description: {
      type: "string",
    },
    status: {
      type: "string",
      default: PROJECT_STATUSES.notStarted,
      enum: Object.keys(PROJECT_STATUSES),
    },
    extent: {
      type: "object",
    },
    view: {
      type: "object",
      properties: {
        featuredContentIds: {
          type: "array",
          items: {
            type: "string",
          },
        },
        featuredImage: {
          type: "object",
        },
        showMap: {
          type: "boolean",
        },
        timeline: {
          type: "object",
        },
      },
    },
  },
} as unknown as IConfigurationSchema;

/**
 * Minimal UI Schema for Hub Project
 */
export const HubProjectCreateUiSchema: IUiSchema = {
  type: "Layout",
  elements: [
    {
      type: "Section",
      options: { section: "stepper", scale: "l" },
      elements: [
        {
          type: "Step",
          labelKey: "{{i18nScope}}.sections.details.label",
          elements: [
            {
              type: "Section",
              labelKey: "{{i18nScope}}.sections.basicInfo.label",
              elements: [
                {
                  labelKey: "{{i18nScope}}.fields.name.label",
                  scope: "/properties/name",
                  type: "Control",
                },
                {
                  labelKey: "{{i18nScope}}.fields.summary.label",
                  scope: "/properties/summary",
                  type: "Control",
                  options: {
                    control: "hub-field-input-input",
                    type: "textarea",
                    helperText: {
                      labelKey: "{{i18nScope}}.fields.summary.helperText",
                    },
                  },
                },
                {
                  labelKey: "{{i18nScope}}.fields.description.label",
                  scope: "/properties/description",
                  type: "Control",
                  options: {
                    control: "hub-field-input-input",
                    type: "textarea",
                    helperText: {
                      labelKey: "{{i18nScope}}.fields.description.helperText",
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          type: "Step",
          labelKey: "{{i18nScope}}.sections.location.label",
          rule: {
            effect: UiSchemaRuleEffects.DISABLE,
            condition: {
              scope: "/properties/name",
              schema: { const: "" },
            },
          },
          elements: [
            {
              type: "Section",
              labelKey: "{{i18nScope}}.sections.location.label",
              elements: [
                {
                  scope: "/properties/extent",
                  type: "Control",
                  options: {
                    control: "hub-field-input-boundary-picker",
                  },
                },
              ],
            },
          ],
        },
        {
          type: "Step",
          labelKey: "{{i18nScope}}.sections.statusAndTimeline.label",
          rule: {
            effect: UiSchemaRuleEffects.DISABLE,
            condition: {
              scope: "/properties/name",
              schema: { const: "" },
            },
          },
          elements: [
            {
              type: "Section",
              labelKey: "{{i18nScope}}.sections.status.label",
              elements: [
                {
                  labelKey: "{{i18nScope}}.fields.status.label",
                  scope: "/properties/status",
                  type: "Control",
                  options: {
                    control: "hub-field-input-select",
                    enum: {
                      i18nScope: "{{i18nScope}}.fields.status.enum",
                    },
                  },
                },
              ],
            },
            {
              type: "Section",
              labelKey: "{{i18nScope}}.sections.timeline.label",
              elements: [
                {
                  scope: "/properties/view/properties/timeline",
                  type: "Control",
                  options: {
                    control: "arcgis-hub-timeline-editor",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Complete UI Schema for Hub Project
 */
export const HubProjectEditUiSchema: IUiSchema = {
  type: "Layout",
  elements: [
    {
      type: "Section",
      labelKey: "{{i18nScope}}.sections.basicInfo.label",
      elements: [
        {
          labelKey: "{{i18nScope}}.fields.name.label",
          scope: "/properties/name",
          type: "Control",
        },
        {
          labelKey: "{{i18nScope}}.fields.summary.label",
          scope: "/properties/summary",
          type: "Control",
          options: {
            control: "hub-field-input-input",
            type: "textarea",
            helperText: {
              labelKey: "{{i18nScope}}.fields.summary.helperText",
            },
          },
        },
        {
          labelKey: "{{i18nScope}}.fields.description.label",
          scope: "/properties/description",
          type: "Control",
          options: {
            control: "hub-field-input-input",
            type: "textarea",
            helperText: {
              labelKey: "{{i18nScope}}.fields.description.helperText",
            },
          },
        },
        {
          labelKey: "{{i18nScope}}.fields.featuredImage.label",
          scope: "/properties/view/properties/featuredImage",
          type: "Control",
          options: {
            control: "hub-field-input-image-picker",
            maxWidth: 727,
            maxHeight: 484,
            aspectRatio: 1.5,
            helperText: {
              labelKey: "{{i18nScope}}.fields.featuredImage.helperText",
            },
            sizeDescription: {
              labelKey: "{{i18nScope}}.fields.featuredImage.sizeDescription",
            },
          },
        },
      ],
    },
    {
      type: "Section",
      labelKey: "{{i18nScope}}.sections.location.label",
      elements: [
        {
          scope: "/properties/extent",
          type: "Control",
          options: {
            control: "hub-field-input-boundary-picker",
          },
        },
        {
          labelKey: "{{i18nScope}}.fields.showMap.label",
          scope: "/properties/view/properties/showMap",
          type: "Control",
        },
      ],
    },
    {
      type: "Section",
      labelKey: "{{i18nScope}}.sections.status.label",
      elements: [
        {
          scope: "/properties/status",
          type: "Control",
          labelKey: "{{i18nScope}}.fields.status.label",
          options: {
            control: "hub-field-input-select",
            enum: {
              i18nScope: "{{i18nScope}}.fields.status.enum",
            },
          },
        },
      ],
    },
    {
      type: "Section",
      labelKey: "{{i18nScope}}.sections.timeline.label",
      elements: [
        {
          scope: "/properties/view/properties/timeline",
          type: "Control",
          options: {
            control: "arcgis-hub-timeline-editor",
          },
        },
      ],
    },
    {
      type: "Section",
      labelKey: "{{i18nScope}}.sections.featuredContent.label",
      options: {
        helperText: {
          labelKey: "{{i18nScope}}.sections.featuredContent.helperText",
        },
      },
      elements: [
        {
          scope: "/properties/view/properties/featuredContentIds",
          type: "Control",
          options: {
            control: "hub-field-input-gallery-picker",
            targetEntity: "item",
            limit: 4,
          },
        },
      ],
    },
  ],
};
