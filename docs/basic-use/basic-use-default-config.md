---
layout: default
title: Default config
nav_order: 2
description: "Default config"
permalink: /basic-use/default-config
---

# Default setting
```javascript
defaultConfig({
  database: 'myDataBase',
  storage: Memory
})
```
Let's use `defaultConfig` to make it easier to configure our arrays. This feature allows one-time configuration of parameters that will be repeated when creating the arrays.
