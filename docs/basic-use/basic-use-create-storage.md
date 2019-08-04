---
layout: default
title: Create storage
nav_order: 3
description: "Create storage"
parent: Basic use
---

### Create Storage
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
