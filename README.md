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


