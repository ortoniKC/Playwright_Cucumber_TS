import { World } from '@cucumber/cucumber';
import { IFixture } from '../../hooks/FixtureManager';

export default class PlaywrightWorld extends World {
    fixture: IFixture;

    constructor(options: any) {
      super(options);
    }
}