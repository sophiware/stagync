---
layout: default
title: Reference
nav_order: 1
description: "Reference"
parent: Config
---

## Reference

### database
string
{: .label }
required
{: .label .label-red }

Define your database.


### name
string
{: .label }
required
{: .label .label-red }

Name of the store.


### table
deprecated
{: .label .label-yellow }

Redundancy of `name`.


### syncErrorHandler
function
{: .label }

Receive read errors or read all data.
By declaring *syncErrorHandler* the handlers of *sync* only
The first to receive the property value, `data => ...`.

```javascript
syncErrorHandler: (err) => {...} 
```

### schemas

Set the properties of your storage.

[Learn more about schemas]({{ site.baseurl }}{% link config/config-schemas.md %})

### methods

Define custom metering for your storage

[Learn more about methods]({{ site.baseurl }}{% link config/config-methods.md %})

[Next: Schemas]({{ site.baseurl }}{% link config/config-schemas.md %})
