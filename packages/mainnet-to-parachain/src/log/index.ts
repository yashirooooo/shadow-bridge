import fs from 'fs';

export default class BridgeLog {

    static debug(content: string) {
        fs.appendFile('./data/bridge-debug.log', content + `\n`, err => {
            if (err) {
                console.error(err)
                return
            }
        })
    }

    static info(content: string) {
        fs.appendFile('./data/bridge-info.log', content + `\n`, err => {
            if (err) {
                console.error(err)
                return
            }
        })
    }
}