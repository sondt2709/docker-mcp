---
applyTo: '**'
---
# dockerode-compose

`docker-compose` in Node.js using [dockerode](https://github.com/apocas/dockerode).

Everything is executed programmatically using `dockerode`, consequently Docker's API.


### ToDo:
* Finish compose spec
* User friendly functions (partial deploys, etc) needs to be implemented.

## Installation

`npm install dockerode-compose`


### Getting started

To use `dockerode-compose` first you need to instantiate it:

``` js
var Dockerode = require('dockerode');
var DockerodeCompose = require('dockerode-compose');

var docker = new Dockerode();
var compose = new DockerodeCompose(docker, './test/wordpress.yml', 'wordpress');

(async () => {
  await compose.pull();
  var state = await compose.up();
  console.log(state);
})();
```

## Documentation
- new DockerodeCompose(dockerode, file, project_name)
- compose.up()
- compose.pull(service, options) - omit service to pull all images, options.streams return the streams without waiting, options.verbose pipe the streams to stdout.

## Tests

 * Tests are implemented using `mocha` and `chai`. Run them with `npm test`.

## Examples

Check the examples folder for more specific use cases examples.
