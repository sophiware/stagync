---
layout: default
title: Set and Add prop
nav_order: 2
description: "Set and Add prop"
parent: Basic use
---

# Set and add prop
```javascript
  await websites.set('urls', ['http://nodejs.com'])
  // or
  await websites.props.urls.set(['http://nodejs.com'])
  
  // Insert
  await websites.props.urls.add('http://npmjs.com')
```

Now let's modify and insert new items to the `urls` property.
Using `set` will override the value, while user` add` will enter new values into the array.
`Add` can only be run from` props`.

At this point the value of the `urls` property should be this:
```javascript
['http://nodejs.com', 'http://npmjs.com']
```
