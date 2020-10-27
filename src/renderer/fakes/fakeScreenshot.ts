import { remote, app } from "electron";
import * as fs from "fs";
import * as path from "path";

let imageUri: string | undefined;

export async function getFakeScreenshotUri() {
    if (!imageUri) {
        const screenshotPath = path.resolve(remote.app.getAppPath(), "assets/screenshot.jpg");
        try {
            const data = fs.readFileSync(screenshotPath);
            imageUri = `data:image/jpeg;base64,${data.toString("base64")}`;
        }
        catch (e) {
            console.error(e);
        }
    }
    return imageUri;
}
