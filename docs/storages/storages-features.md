---
layout: default
title: Features
nav_order: 1
description: "Features"
parent: Storages
---

## Features

all storage methods are asynchronous. 
You can get the response from this method by using * .then * or 
await if it is within the scope of an asynchronous function.

## Setter and Getter

### get(prop)
null
{: .label }
string
{: .label }

Recover data from storage.

```javascript
const all = await createStorage.websites.get()
const urls = await createStorage.websites.get('urls')
```

### set(props)
object
{: .label }

Defines one or more properties of a storage.

```javascript
createStorage.website.set({
    urls: ['github.com']
})
```

## Synchronizers

### sync(props)
object
{: .label }

Receive functions that will be performed when a prop is modified.

```javascript
createStorage.websites.sync({
    urls(err, data){ ... }
})
```

### syncAll(callback)
function
{: .label }

Receives functions that will be executed when any prop is modified.

```javascript
createStorage.websites.syncAll((err, data) => {...})
```

### syncMany(propsNamesArray, functions)
array
{: .label }
function
{: .label }

Receives functions that will be executed when the defined props are modified.

```javascript
createStorage.websites.syncMany(['urls', 'names'], (err, data) => {...})
```

## Utils

### clear()

Clears the entire table.

```javascript
createStorage.websites.clear()
```

### restoreDefaultValues()

Restores the data to the default values registered in the schema.

```javascript
createStorage.websites.restoreDefaultValues()
```

### restoreDefaultValues()

Restores the data to the default values registered in the schema.

```javascript
createStorage.websites.restoreDefaultValues()
```

### still()

Silences the emission of modification events for the context in which it was applied. 
This is a chained method, returning to the instantiated and muted object.

```javascript
createStorage.websites.still().set({urls: ['http://google.com']})
```

[Next: Storages props]({{ site.baseurl }}{% link createStorage/createStorage-props.md %})
