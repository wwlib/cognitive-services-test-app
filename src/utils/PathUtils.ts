import path from 'path';
const electronApp = require('electron').remote.app;

class PathUtils {

    static findRoot(): string {
        return electronApp.getAppPath()
    }

    static resolve(projectUri: string): string {
        let projectRoot: string = PathUtils.findRoot();
        return path.resolve(projectRoot, projectUri);
    }
}

export default PathUtils;