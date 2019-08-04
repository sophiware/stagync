---
layout: default
title: Reference
nav_order: 1
description: "Reference"
parent: Config
---

{: .no_toc }

## Reference
### database
string
{: .label }
required
{: .label .label-red }

Define your database.


### storage
function
{: .label }
class
{: .label }
required
{: .label .label-red }

The type of storage you use. Here you must define with the stagync-storage class or function imported in the project.


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

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}
