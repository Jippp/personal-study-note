/* 访问装饰器 */

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