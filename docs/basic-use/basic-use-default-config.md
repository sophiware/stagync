---
layout: default
title: Default config
nav_order: 2
description: "Default config"
parent: Basic use
---

### Default setting
```javascript
defaultConfig({
  database: 'myDataBase',
  storage: Memory
})
```
Let's use `defaultConfig` to make it easier to configure our arrays. This feature allows one-time configuration of parameters that will be repeated when creating the arrays.

[Next: Create storage]({{ site.baseurl }}{% link basic-use/basic-use-create-storage.md %})
