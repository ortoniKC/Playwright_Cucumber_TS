import { World } from '@cucumber/cucumber';
import FixtureManager from '../../hooks/FixtureManager';

export default class PlaywrightWorld extends World {
  fixture: FixtureManager;
}