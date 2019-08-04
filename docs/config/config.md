---
layout: default
title: Config
nav_order: 1
description: "Config"
has_children: true
---

### Config

You can set your storage settings in two ways.

The first is directly in `createStorage` the second is `defaultConfig`.
The difference is that when the setting is set in *createStorage*,
it will only fit the scope of that storage. Already when defined
in *defaultConfig*, it will be arrayed globally for all storages
created.
### Configuration Properties

#### data base
*String* *required*

Define your database.


#### name
*String* *required*

Name of the store.


#### table
*depreciated*

Redundancy of `name`.


#### syncErrorHandler
*Function*

Receive read errors or read all data.
By declaring *syncErrorHandler* the handlers of *sync* only
The first to receive the property value, `data => ...`.

```javascript
syncErrorHandler: (err) => {...} 
```


#### schemas

Set the properties of your storage.

[Learn more about schemas]({{ site.baseurl }}{% link config/config-schemas.md %})

#### methods

Define custom metering for your storage

[Learn more about methods]({{ site.baseurl }}{% link config/config-methods.md %})

