---
layout: default
title: Basic use 
nav_order: 2
description: "Welcome to Stagync!"
permalink: /basic-use
---
# Basic use
A brief demonstration of stagync usability.

---

### Step 1
Stagync has a number of features and apis available. In this example we will demonstrate the use of this library in a simple and friendly way.

#### Import
```javascript
import { defaultConfig, createStorage } from 'stagync'
import Memory from 'stagync-storage-memory'

// or

const { defaultConfig, createStorage }  = require('stagync').default
const Memory = require('stagync-storage-memory').default
```
Initially we need to import stagync and stagync-storage into our application. Using stagync-storage is essential. It defines the type of storage you will use for your storage. You can find some stagync-storages available on the internet or create them yourself. To learn more about stagync-storage click here.

Let's use this example stagync-storage Memory, which is capable of storing data in memory, either in an app, website or backend.
#### Default setting
```javascript
defaultConfig({
  database: 'myDataBase',
  storage: Memory
})
```
Let's use `defaultConfig` to make it easier to configure our arrays. This feature allows one-time configuration of parameters that will be repeated when creating the arrays.

#### First Storage
```javascript
createStorage({
  websites: {
    schema: {
      urls: {
        type: 'array',
        default: [
          'http://google.com',
          'http://github.com'
        ]
      }
    }
  }
})
```

By creating a Storage you will centralize the application information in one place. In addition all listeners to this Storage will be notified if any change in property occurs.

In our example we created the `website` storage with the` urls` property of type `array` and with the default value set.
This means that when attempting to mill or redeem the `urls` property of the storage` websites` you will be required to use the `array` type. If it does not modify the property, it returns the default value.

Now, let's see how to make our first CRUD in this storage.

#### Crud
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
