# Fortune Ninja

A set of tools for testing Fortune-based interfaces

To initialise:
```
var ninja = require("fortune-ninja")({
  fixtureTemplates: ...//fixture templates if any
});

ninja.connect({
  databases: ...,//list of mongodb connection strings, required
  fortuneClient: ...,//a pre-configured instance of fortuneClient, required
  baseUrl: ... //service url, optional
})
```


Currently Ninja has three main components:
* `request`: a thin pre-configurable wrapper for requesto library
* `fixtureFactory`: a mechanism for efficiently prepopulating a given fortune app with fixture data


TODO:
* better docs
* segregate fixtureFactory into it's own npm package
* move the pre-config code from the http wrapper into requesto