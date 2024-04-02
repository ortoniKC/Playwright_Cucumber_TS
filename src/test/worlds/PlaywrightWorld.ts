// world.ts
import { World } from '@cucumber/cucumber';
import { FixtureManager } from '../../hooks/hooks';

export default class PlaywrightWorld extends World {
  fixture: FixtureManager;
}