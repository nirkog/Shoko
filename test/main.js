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
    const options = {list: ['Avi', 'Rona', 'Tamuya', 'Habib']};
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

/* getFile(path.join(testPath, inputFileName))
    .then((res, err) => {
        if(err)
            console.log(err);

        const options = {message: 'Hello world'};
        const date = new Date();
        let newFile = '', oldFile = res.toString();

        let startTime = date.getTime();

        let data = shoko.render(oldFile, options);
        let renderingTime = {time: date.getTime(), timeToRender: date.getTime() - startTime};

        fs.writeFile(path.join(testPath, outputFileName), data);
        let writingTime = date.getTime() - renderingTime.time;

        let totalTime = renderingTime.timeToRender + writingTime;

        console.log(`Rendering time: ${renderingTime.timeToRender} ms.`.yellow);
        console.log(`Writing time: ${writingTime} ms.`.yellow);
        console.log(`Total time: ${totalTime} ms.`.yellow);

        setInterval(() => {
            getFile(path.join(testPath, inputFileName))
                .then((res, err) => {
                    newFile = res.toString();

                    if(newFile != oldFile) {
                        console.log('updating file...'.rainbow);

                        oldFile = newFile;

                        startTime = date.getTime();

                        data = shoko.render(newFile, options);
                        renderingTime = {time: date.getTime(), timeToRender: date.getTime() - startTime};

                        fs.writeFile(path.join(testPath, outputFileName), data);
                        writingTime = date.getTime() - renderingTime.time;

                        totalTime = renderingTime.timeToRender + writingTime;

                        console.log(`Rendering time: ${renderingTime.timeToRender} ms.`.yellow);
                        console.log(`Writing time: ${writingTime} ms.`.yellow);
                        console.log(`Total time: ${totalTime} ms.`.yellow);
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }, 500);
    })
    .catch((err) => {
        shoko.reset();
        console.log(err);
    }); */