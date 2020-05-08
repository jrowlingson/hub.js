import { getProp } from '@esri/hub-common';

import { ICard, ITemplatizedCard } from "./types";

export const convertJumbotronCard = function convertJumbotronCard (card: ICard): ITemplatizedCard {
  const result = {
    card,
    assets: [] as string[]
  };
  if (getProp(card, 'component.settings.fileSrc')) {
    result.assets.push(card.component.settings.fileSrc);
  }
  if (getProp(card, 'component.settings.cropSrc')) {
    result.assets.push(card.component.settings.cropSrc);
  }
  return result;
};
