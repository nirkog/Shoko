# Shoko

#### A node.js templating engine

**Shoko** is a simple to use templating engine, with a very straight forward and intuative syntax. Shoko also offers many other features, including: mixins, variables, comments.  
As shoko is in it's early development, many features that we intend to add are stil missing.

## Installation

Shoko is super easy to get up and running.
simply download it from npm, like this.

    npm install shoko --save

## Syntax

Shoko has a very easy to grasp syntax. Elements in shoko are seprated by curly braces.  
Here is an example:

    doctype html
    html {
        head {
            title {
                'My First Shoko Page'
            }
        }

        body {
            h1 {
                'Shoko is awesome.'
            }
        }
    }

Which will render to this HTML:

    <!DOCTYPE html>
    <head>
        <head>
            <title>My First Shoko Page</title>
        </head>

        <body>
            <h1>
                Shoko is awesome
            </h1>
        </body>
    </head>

## API

**Shoko is really easy to use.**  
To render plain shoko text, just use the render function.

    const shoko = require('shoko');  

    let textToRender = 'h1 { "Hello world" }';

    //<h1>Hello world</h1>
    let renderedHTML = shoko.render(textToRender);

To render from a file, use the renderFile function.

    let renderedFile = shoko.renderFile('file.sk');

**Yes, I'ts that simple!**

## Framework Integration

**Currently Shoko can only be integrated with express.js, but integration with other frameworks is on the top of our TODO list.**

### Integrating with Express.js

Integrating Shoko with Express is so easy.  
Just set the engine to the _Shoko renderFile_ function.

    app.engine('sk', shoko.renderFile);

Then, you can just render views normally. For example:

    app.get('/', (res, req) => {
        res.render('index', {});
    });