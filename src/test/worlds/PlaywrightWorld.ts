import { IWorldOptions, setWorldConstructor, World } from '@cucumber/cucumber';
import { IFixture } from '../../hooks/FixtureManager';

export interface IPlaywrightWorld extends World {
  fixture: IFixture;
  store: any;
}

export default class PlaywrightWorld extends World implements IPlaywrightWorld {
  fixture: IFixture;
  store: any;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(PlaywrightWorld);