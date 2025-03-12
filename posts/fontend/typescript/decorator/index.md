---
date: 2025-03-12
title: typescript中的装饰器
category: 装饰器
tags:
- 装饰器
description: 总结一下TS中的装饰器用法
---

# TS装饰器

## 装饰器类型

装饰器目前还没有正式标准化，ts中做了兼容支持了装饰器语法。
需要在`tsconfig.json`中添加以下配置：
```js
"experimentalDecorators": true, // 支持未标准化的装饰器语法
"emitDecoratorMetadata": true // 启动metadata数据支持
```

装饰器的主要作用就是用来增强功能、拦截处理等。

> [!NOTE]
> 测试使用bun，因为能直接运行ts、tsx语法，不用额外配置。
> bun init选择blank即可创建一个简单的框架。

### 类装饰器

简单示例认识类装饰器：
```ts
function classDecorator(constructor: Function) {
  console.log('装饰器执行')
}

@classDecorator
class DecoratorClass {
  constructor() {
    console.log('类实例化')  
  }
}

const demoInstance = new DecoratorClass()
```

然后在控制台执行输出了：
```bash
装饰器执行
类实例化
```

可以看到**装饰器是在类定义时调用的，并不是实例化时**。

在类装饰器中接收**类作为参数**，所以在装饰器中可以增强类的功能。

比如实现单例模式：
```ts
function singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  const instanceKey = Symbol('instance')

  const newConstructor: any = function(...args: any[]) {
    if(!newConstructor[instanceKey]) {
      newConstructor[instanceKey] = new constructor(...args)
    }
    return newConstructor[instanceKey];
  }

  newConstructor.prototype = constructor.prototype

  return newConstructor as T
}

@singleton
class Query {
  private name: string;

  constructor(name: string) {
    this.name = name
    console.log('类实例化')
  }
}

const query1 = new Query('123')
const query2 = new Query('234')
console.log(query1 === query2)
```

在控制台执行后输出：
```bash
类实例化
true
```

可以看到只会执行一次实例化操作，完成了单例模式。

### 方法装饰器

装饰器也能用在方法上，当作为方法装饰器时接收三个参数：
```ts
function method(target: any, propertyKey: any, descriptor: any) {
  console.log(target, propertyKey, descriptor)
}

class Math {
  constructor() {
    console.log('实例化')
  }
  @method
  add(a: number, b: number) {
    return a + b
  }
}

const math = new Math()

math.add(1,2)
```

控制台执行输出：
```bash
Math {
  add: [Function: add],
} add {
  value: [Function: add],
  writable: true,
  enumerable: false,
  configurable: true,
}
实例化
```

在**运行时调用装饰器**，接收的三个参数分别是：
- target：实例方法上，就是类的原型对象；静态方法上，就是类；
- propertyKey：方法名称
- descriptor：方法的属性描述符
  - value：函数体
  - writable：是否可写
  - enumerable: 是否可枚举
  - configurable：是否可配置

一般使用场景都是重新替换`descriptor.value`做一些拦截操作，比如参数校验等。需要注意**this的问题**。

```ts
function validate<T extends (...args: any[]) => any>(
  validator: (...p: Parameters<T>) => boolean, 
  errorMsg: string
) {
  return function(target: any, propertyKey: string, descriptor: any) {
    const prevMethod = descriptor.value as T

    descriptor.value = function(...props: Parameters<T>) {
      if(!validator(...props)) {
        throw new Error(`${propertyKey}: ${errorMsg}`)
      }
      return prevMethod.apply(this, props)
    }

    return descriptor
  }
}

type Add = (a: number, b: number) => number;

class Math {

  @validate<Add>((a, b) => {
    if(a !== 1) return false
    return true
  }, '参数有误')
  add(a: number, b: number): number {
    return a + b
  }
}
const math = new Math()
console.log(math.add(2,2))
```

装饰器可以支持函数式，只要最后返回的是函数即可。

在这里例子中，通过方法装饰器重写了方法，添加了自定义校验规则，增强了方法功能。

在函数中需要特别注意**this指向问题**，如果不修改this指向，可能会导致this上下文丢失的问题。

### 访问装饰器

专门用于装饰类中的访问器属性(getter、setter)。可以看作是`方法装饰器`的一个细分，所以同样在运行时调用、接收三个参数。

区别就是第三个属性描述符参数中包括以下内容：
- get：获取属性值的函数
- set：设置属性值的函数
- enumerable
- configurable

一个简单的拦截示例：
```ts
function log(target: any, propertyKey: string, descriptor: any) {
  const prevGet = descriptor.get
  descriptor.get = function() {
    console.log(`${Date.now()}: 读取了属性`)
    return prevGet.apply(this)
  }
}

class Demo {
  private _name: string;

  constructor(name: string) {
    this._name = name
  }

  @log
  get name(): string {
    return this._name;
  }

  set name(newName: string) {
    this._name = newName
  }
}

const demo = new Demo('123')
console.log(demo.name)
```

在装饰器中重写get，做了日志处理。

### 属性装饰器

用于装饰类中的属性。

```ts
function property(target: any, propertyKey: string) {
  console.log('属性装饰器')
  console.log(propertyKey)
}

class Demo {
  @property
  public name: string;

  constructor(name: string) {
    console.log('实例化')
    this.name = name
  }
}

const demo = new Demo('123')
```

接收两个参数，相比上面的少了属性描述符参数。同样也是在**类定义时调用**。

并且属性装饰器的返回值会被忽略，也不能直接修改属性行为，但可以通过`Proxy、Object.defineProperty`来增强属性。

### 参数装饰器

用于类构造函数或方法中的参数声明，主要用于收集关于参数的元数据。

```ts
function prop(target: any, methodName: string, index: number) {
  console.log('target', target)
  console.log('methodName', methodName)
  console.log('index', index)
}

class Demo {
  add(@prop a: number, b: number) {
    return a + b
  }
}
```

也是在**类定义时调用**，接收三个参数：
- target：类，和上面都是相同的
- methodName：参数所在方法的名称
- index：参数的索引

参数装饰器的特点和上面的属性装饰器类似，都会忽略返回值，并且无法直接修改参数。

**同方法多个参数装饰器，顺序是从右到左执行的。**

## 装饰器原理

原理实际就是一个函数调用，将参数(类、方法、属性、参数等)传入函数执行。

比如以下装饰器的使用：
```ts
function LogMethod(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
}

class Demo {
  @LogMethod
  public foo(bar: number) {
    // do nothing
  }
}

const demo = new Demo();
```

经过ts的编译成：
```js{9-11,26-28}
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, 
  r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, 
  d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
    r = Reflect.decorate(decorators, target, key, desc);
  }else {
    for (var i = decorators.length - 1; i >= 0; i--) {
      if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    }
  }
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// @experimentalDecorators
function LogMethod(target, propertyKey, descriptor) {
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
}
class Demo {
  foo(bar) {
    // do nothing
  }
}
__decorate([
  LogMethod
], Demo.prototype, "foo", null);
const demo = new Demo();
```

重点在`__decorate`方法的实现，会遍历传入的`decorators`函数，即我们自定义的装饰器函数，将获取到的原型对象、名称等参数传给装饰器函数执行。

> [!NOTE]
> 这里的`Reflect.decorate`并不是标准，只是给es预留的空，当前是没有实现的。

### 元数据

```js
"emitDecoratorMetadata": true
```
`tsconfig.json`中该配置的作用就是引入元数据。

主要有两个api的使用：`Reflect.defineMetadata()`以及`Reflect.getMetadata()`

```js
// 在类或者对象上定义元数据
Reflect.defineMetadata(key, value, classObject)
// 在方法上定义元数据
Reflect.defineMetadata(key, value, classPrototype, methodName)
// 在属性上定义元数据
Reflect.defineMetadata(key, value, classPrototype, protoKey)
```

比如`Refloect.defineMetadata('testKey', 'testValue', obj)`就是在`obj`对象上定义了一个`testKey: testValue`的元数据，可以通过`Reflect.getMetadata('testKey', obj)`来取出该条元数据。

简单点来理解就是可以在类、对象、方法、属性上定义**元数据Metadata**提供使用。

上面的ts配置就是添加了三条元数据：
- `design:type`：当前作用对象的类型，比如方法装饰器中就是Function
- `design:paramtypes`：参数类型
- `design:returntype`：返回值类型
