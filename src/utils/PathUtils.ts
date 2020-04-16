import path from 'path';
// const findRoot = require('find-root');
// const normalize = require('normalize-path');
const electronApp = require('electron').remote.app;

class PathUtils {

    static findRoot(uri: string): string {
        // return findRoot(uri);
        return electronApp.getAppPath()
    }

    static resolve(projectUri: string): string {
        let projectRoot: string = PathUtils.findRoot(__dirname);
        return path.resolve(projectRoot, projectUri);
    }
}

export default PathUtils;