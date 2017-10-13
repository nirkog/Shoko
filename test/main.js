const fs = require('fs');
const path = require('path');
const colors = require('colors');

const shoko = require('./../index');

const testPath = path.join(__dirname, '../test/');
const inputFileName = 'test.sk';
const outputFileName = 'test.html';

function getFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err)
                return reject(err);
            
            resolve(data);
        });
    });
}

async function run() {
    let oldFile = await getFile(path.join(testPath, inputFileName));
    oldFile = oldFile.toString();
    const options = {list: [1, 2, 3], test: 'Hello World'};
    let newFile = '';

    let data = shoko.render(oldFile, options);
    console.log('rendered File succefully'.yellow);

    fs.writeFileSync(path.join(testPath, outputFileName), data);

    setInterval(async () => {
        newFile = await getFile(path.join(testPath, inputFileName));
        newFile = newFile.toString();

        if(newFile != oldFile) {
            console.log('updating file...'.rainbow);

            oldFile = newFile;

            data = shoko.render(newFile, options);
            console.log('rendered File succefully'.yellow);

            fs.writeFileSync(path.join(testPath, outputFileName), data);
        }
    }, 500);
}

run();