---
layout: default
title: Schemas
nav_order: 2
description: "Schemas"
parent: Config
---

## Schemas

We have two models of props for storages, the `common props`, and the `virtual props`.
In *common props* you can set the default type and value. These props can be modified.
*Virtual props* perform a function every time they are called and trigger change events when a listener 
is declared in it through the `listener` property

```javascript
{
    schemas: {
        firstname: {
            type: 'string',
            default: 'John'
        },
        lastname: {
            type: 'string'
        },
        fullname: {
            async get(){
                const { firsname, lastname } = await this.get()
                return this.firstname + ' ' + this.lastname
            },
            listener: ['firstname', 'lastname']
        }
    }
}
```

### type
string
{: .label }
required
{: .label .label-red }

Prop value type. Are accepted:
- string
- number
- array
- object
- boolean

### default
string
{: .label }

Default value of prop.

### get
function
{: .label }

Function that will be executed when called.

### listener
array
{: .label }

When set, the virtual prop raises an event when one of the properties described in the array is modified.

### validation
Validation Function Always performed before the prop is monified. Receives the future value of prop as a parameter, 
be a common function, or asynchronous.

When common, expects a Boolean return, if true, passed validation, if false, did not pass.

When asynchronous (Promise) waits for the end of the function execution, to deny the validation it is necessary 
to throw an exception error, example:
```javascript
throw new Error('Validation Error!')
```

[Next: Methods]({{ site.baseurl }}{% link config/config-methods.md %})
