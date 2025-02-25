import { EntityType } from "../../src";
import * as wellKnownCatalog from "../../src/search/wellKnownCatalog";
import {
  getWellKnownCatalog,
  getWellknownCollection,
  getWellknownCollections,
  IGetWellKnownCatalogOptions,
  WellKnownCollection,
  dotifyString,
} from "../../src/search/wellKnownCatalog";
import { mockUser } from "../test-helpers/fake-user";

describe("WellKnownCatalog", () => {
  describe("getWellKnownCatalog", () => {
    let options: IGetWellKnownCatalogOptions;
    beforeEach(() => {
      options = {
        user: mockUser,
        collectionNames: [],
      };
    });
    it("returns the expected catalog", () => {
      let chk = getWellKnownCatalog(
        "mockI18nScope",
        "myContent",
        "item",
        options
      );
      expect(chk.scopes).toBeDefined();
      expect(chk.scopes?.item?.filters).toEqual([
        { predicates: [{ owner: "vader" }] },
      ]);
      expect(chk.collections?.map((c) => c.key)).toEqual([
        "appAndMap",
        "dataset",
        "document",
        "feedback",
        "site",
      ]);
      chk = getWellKnownCatalog("mockI18nScope", "favorites", "item", options);
      expect(chk.scopes).toBeDefined();
      expect(chk.scopes?.item?.filters).toEqual([
        { predicates: [{ group: "7654321" }] },
      ]);
      expect(chk.collections?.map((c) => c.key)).toEqual([
        "appAndMap",
        "dataset",
        "document",
        "feedback",
        "site",
      ]);
    });
    it("throws if not passing a user for a catalog that requires it", () => {
      expect(() =>
        getWellKnownCatalog("mockI18nScope", "myContent", "item")
      ).toThrowError('User needed to get "myContent" catalog');
      expect(() =>
        getWellKnownCatalog("mockI18nScope", "favorites", "item")
      ).toThrowError('User needed to get "favorites" catalog');
      expect(() =>
        getWellKnownCatalog("mockI18nScope", "organization", "item")
      ).toThrowError('User needed to get "organization" catalog');
    });
    it("does not throw if not passing a user for a catalog that does not require it", () => {
      const chk = getWellKnownCatalog("mockI18nScope", "world", "item");
      expect(chk.scopes?.item?.filters).toEqual([
        { predicates: [{ access: "public" }] },
      ]);
    });
    it("throws if passed an invalid entity type", () => {
      expect(() =>
        getWellKnownCatalog(
          "mockI18nScope",
          "myContent",
          "villain" as EntityType
        )
      ).toThrowError('Wellknown catalog not implemented for "villain"');
    });
    it("returns the catalog with specific collection requested", () => {
      options.collectionNames = ["document", "feedback"];
      const chk = getWellKnownCatalog(
        "mockI18nScope",
        "organization",
        "item",
        options
      );
      expect(chk.collections?.length).toBe(2);
    });
    it("returns no collections if passed an invalid collection name ", () => {
      options.collectionNames = ["fakeContent" as WellKnownCollection];
      const chk = getWellKnownCatalog(
        "mockI18nScope",
        "organization",
        "item",
        options
      );
      expect(chk.collections?.length).toBe(0);
    });
  });

  describe("getWellknownCollections", () => {
    it("returns the default collections", () => {
      const chk = getWellknownCollections("mockI18nScope", "item");
      expect(chk.map((a) => a.key)).toEqual([
        "appAndMap",
        "dataset",
        "document",
        "feedback",
        "site",
      ]);
      expect(chk[1].scope.filters[0].predicates[0].type).toEqual([
        "CSV Collection",
        "CSV",
        "Feature Collection",
        "Feature Layer",
        // Changed as part of https://confluencewikidev.esri.com/x/KYJuDg
        "Feature Service",
        "File Geodatabase",
        "GeoJSON",
        "GeoJson",
        "KML Collection",
        "KML",
        "Shapefile",
        "Stream Service",
        "Table",
        "Image Service",
      ]);
    });
    it("returns the collection from custom request", () => {
      const chk = getWellknownCollections("mockI18nScope", "item", [
        "appAndMap",
        "dataset",
        "template",
      ]);
      expect(chk.map((a) => a.key)).toEqual([
        "appAndMap",
        "dataset",
        "template",
      ]);
    });
  });

  describe("getWellknownCollection", () => {
    it("returns the correct collection requested", () => {
      const chk = getWellknownCollection("mockI18nScope", "item", "appAndMap");
      expect(chk.key).toEqual("appAndMap");
    });
  });

  describe("dotifyString", () => {
    it("returns the correct dotified strings", () => {
      let chk = dotifyString("stringWithoutDot");
      expect(chk).toEqual("stringWithoutDot.");
      chk = dotifyString("stringWithDot.");
      expect(chk).toEqual("stringWithDot.");
      chk = dotifyString("");
      expect(chk).toEqual("");
    });
  });
});
