---
applyTo: '**/*.ts'
---
# docker-modem

[Docker](https://www.docker.com/)'s Remote API network layer module.

`docker-modem` will help you interacting with `Docker`, since it already implements all the network strategies needed to support all `Docker`'s Remote API endpoints.

It is the module powering (network wise) [dockerode](https://github.com/apocas/dockerode) and other modules.

## Usage

### Getting started

``` js
var Modem = require('docker-modem');
var modem1 = new Modem({socketPath: '/var/run/docker.sock'});
var modem2 = new Modem(); //defaults to above if env variables are not used
var modem3 = new Modem({host: 'http://192.168.1.10', port: 3000});
var modem4 = new Modem({protocol:'http', host: '127.0.0.1', port: 3000});
var modem5 = new Modem({host: '127.0.0.1', port: 3000}); //defaults to http
```

### SSH

You can connect to the Docker daemon via SSH in two ways:

* Using the built-in SSH agent.
* Implement your own custom agent.

``` js
//built-in SSH agent
var modem1 = new Modem({
  protocol: 'ssh',
  host: 'ssh://127.0.0.1',
  port: 22
});

//custom agent
var customAgent = myOwnSSHAgent({host: 'ssh://127.0.0.1', port: 22});
var modem2 = new Modem({
  agent: customAgent,
});
```
