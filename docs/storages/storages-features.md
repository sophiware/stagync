---
layout: default
title: Storages features
nav_order: 4
description: "Storages features"
parent: Storages
---

## Storage Features

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
const all = await storages.websites.get()
const urls = await storages.websites.get('urls')
```

### set(props)
object
{: .label }

Defines one or more properties of a storage.

```javascript
storages.website.set({
    urls: ['github.com']
})
```

## Synchronizers

### sync(props)
object
{: .label }

Receive functions that will be performed when a prop is modified.

```javascript
storages.websites.sync({
    urls(err, data){ ... }
})
```

### syncAll(callback)
function
{: .label }

Receives functions that will be executed when any prop is modified.

```javascript
storages.websites.syncAll((err, data) => {...})
```

### syncMany(propsNamesArray, functions)
array
{: .label }
function
{: .label }

Receives functions that will be executed when the defined props are modified.

```javascript
storages.websites.syncMany(['urls', 'names'], (err, data) => {...})
```

## Utils

### clear()

Clears the entire table.

```javascript
storages.websites.clear()
```

### restoreDefaultValues()

Restores the data to the default values registered in the schema.

```javascript
storages.websites.restoreDefaultValues()
```