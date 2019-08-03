---
layout: default
title: Get prop
nav_order: 2
description: "Get prop"
parent: Basic use
---

# Get Prop
```javascript
import { storages } from 'stagync'

const { websites } = storages

async function getProps(){
  const urlsAlt = await websites.get('urls')
  console.log('urlsAlt', urlsAlt)
  // or
  const urlsProps = await websites.props.urls.get()
  console.log('urlsProps', urlsProps)
}

getProps()
```
##### Line by Line
- *Line 1*: In the first line of this example, we import all available arrays. This is possible thanks to the `createStorage` function presented in the previous step.
- *Line 3*: Next we look at `websites` of the` storages` object, this brings more clarity to the code. But we could simply use `storages.websites`.
- *Line 5*: Most features available in a storage are excreted asynchronously. For better readability we use a function declaring `async` as the scope of our application.
- *Line 6*: Finally we retrieve the value of the `urls` property, as we haven't modified it yet we will retrieve the default value.
- *Line 9*: Another way to retrieve the `urls` property is by using` props` resources, it abstracts and adds new features to your property, such as `add` and` remove` that can be used to enter new values in properties of type *array* and *object*.
- *Line 13*: Finally, let's execute the `getProps` function. You will see on your application console the default value of the `urls` property.

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
