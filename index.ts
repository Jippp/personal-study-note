/* 
  类装饰器
  @expression语法
*/

function classDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
  // 1.可以接收到类作为参数，所以可以修改类
  // 2.可以返回一个新的类替换或继承原来的类

  // // 1.修改原型 添加新的方法或属性
  // constructor.prototype.decoratorMethod = () => {
  //   return '类装饰器添加的方法'
  // }

  // 2.继承旧类 增强功能
  // return class extends constructor {

  //   constructor(...args: any[]) {
  //     super(...args)
  //   }

  //   public getName() {
  //     return 'new Name'
  //   }
  // }
  // 2.替换旧类
  return class NewClass {
    name: string;

    constructor(name: string) {
      this.name = name
    }

    public getName() {
      return this.name
    }
  }

  // console.log('类装饰器：', constructor.name)
}

@classDecorator
class Example {
  name: string;

  constructor(name: string) {
    this.name = name
    // console.log('Example实例化')
  }
}

// const example = new Example('example name')
// // console.log((example as any).decoratorMethod())
// console.log((example as any).getName())

// 通过类装饰器实现一个单例模式
function singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  const instanceKey = Symbol('instance')
  const newConstructor: any = function(...args: any[]) {
    if (!newConstructor[instanceKey]) {
      newConstructor[instanceKey] = new constructor(...args);
    }
    return newConstructor[instanceKey];
  };

  newConstructor.prototype = constructor.prototype

  return newConstructor as T
}

@singleton
class Query {
  private connectString: string

  constructor(connectString: string) {
    this.connectString = connectString
    console.log('Query实例化')
  }
}

// const query1 = new Query('123')
// const query2 = new Query('234')
// console.log(query1 === query2)


/* 装饰器执行是在类定义时执行，而不是实例化时 */
// function decoratorSort(constructor: Function) {
//   console.log('装饰器执行')
// }

// @decoratorSort
// class DecoratorSort {
//   constructor() {
//     console.log('类实例化')
//   }
// }

// console.log('代码执行')
