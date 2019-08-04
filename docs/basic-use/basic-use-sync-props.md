---
layout: default
title: Sync props
nav_order: 6
description: "Sync props"
parent: Basic use
---

### Sync props
```javascript
  websites.sync({
    urls(err, data){
        if(err){
            throw err
        }
        
        console.log(data)
    }
  })
  
  //or
  websites.props.urls.sync((err, data) => {
    if(err){
        throw err
    }
    
    console.log(data)
  })
```

This is one of the main features in Stagync: the properties sync.
With it you can hear any event of change of ownership.
All you have to do is pass a callback and wait for the event.

#### syncErrorHandler
The callback returns two parameters by default `error` and` data`.
But you can also create callbacks without waiting for errors to return.


For this set in the settings (can be in defaultCofing) `syncErrorHandler`, example:

```javascript
defaultConfig({
  database: 'myDataBase',
  storage: Memory,
  syncErrorHandler: err => console.log(err)
})
```

In this example, sync ErrorHandler will be executed every time an error occurs when entering a new value in a property.

[Next: Considerations]({{ site.baseurl }}{% link basic-use/basic-use-considerations.md %})
