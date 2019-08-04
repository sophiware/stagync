---
layout: default
title: Storages disconnectors
nav_order: 3
description: "Storages disconnectors"
parent: Storages
---

## Disconnectors

Stagync uses in its native javascript Event library. And as is well known, we need to take some precautions to avoid Memory Leaks.

In the case of events, memory leaks occur when there are too many listeners for the same event.

If you are creating a sync every time a specific function is called, 
you will be overloading the javascript event manager with jobs that could possibly be of no use.

A good example of this is the use of stagync with React.
It is likely that in this scenario you will create a sync inside React's *componentMount*. 
This makes sense because you only want to perform an action within your component, such as changing a state value. The problem occurs when you upgrade the component or remove it without "disconnecting" sync.

In this case you should use *componentWillUnmount* by unplugging sync inside it, thus freeing up space in javascript's event handler and ensuring that your syncs execute correctly.


[See more about using Stagync with React here.]({{ site.baseurl }}{% link react/react.md %})
## Disconnecting Features

### discontinue(propName)
string
{: .label }

Removes sync from a property within sync scope.

```javascript
storages.websites.discontinue('urls')
```

### discontinueAll()

Removes sync from all properties within sync scope.

```javascript
storages.websites.discontinueAll()
```

### discontinueGlobalAll()

Removes sync from all properties of a score in all scopes.

```javascript
storages.websites.discontinueGlobalAll()
```

### destroy()

Remova uma sincronização de todas as propriedades de um armazenamento em todos os itens e remova todos os itens.

```javascript
storages.websites.discontinueGlobalAll()
```

### clear()

Remove all items from storage.

```javascript
storages.websites.clear()
```
