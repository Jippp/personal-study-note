/* 属性装饰器 */

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

