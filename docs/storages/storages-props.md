---
layout: default
title: Storages props
nav_order: 1
description: "Storages props"
parent: Storages
---

## Storage Props

Storages props is a feature available as of version 0.5.0. 
This feature allows the exhutation of methods by specifying the direct prop of the storage object.

You can also export props before you run them.

```javascript
const { urls } = storages.props

urls.add('http://google.com')
const sites = await urls.get()  // [http://github.com, http://google.com]
urls.remove('http://github.com')  // [http://google.com]
```

### props.*.get()

Returns the current value of prop.

```javascript
const urls = await storages.websites.props.urls.get()
```

### props.*.set(value)
any
{: .label }

Defines the value of a prop.

```javascript
storages.websites.props.urls.set(['http://github.com'])
```

### props.*.add(value)
any
{: .label }

Inserts a value into a prop, only for `array` type `object`.

```javascript
storages.websites.props.urls.add('http://gogle.com')
```

### props.*.remove(value)
string
{: .label }
int
{: .label }

Removes an item from an array or object. If the type is array, 
expect an index (type int), if object, expect the property name (type string).

```javascript
storages.websites.props.urls.sync((err, data) => {})

// With syncErrorHandler defined.
storages.websites.props.urls.sync((data) => {})
```

### props.*.sync(callback)
function
{: .label }

Inserts a value into a prop, only for `array` type `object`.

```javascript
storages.websites.props.urls.sync((err, data) => {})

// With syncErrorHandler defined.
storages.websites.props.urls.sync((data) => {})
```


