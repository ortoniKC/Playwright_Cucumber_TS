import * as fs from 'fs-extra';
import { browserDetailsPath } from '../browsers/browserManager';

try {
    fs.ensureDir("test-results");
    fs.emptyDir("test-results");
    fs.remove(browserDetailsPath)
} catch (error) {
    console.log("Folder not created! " + error);
}