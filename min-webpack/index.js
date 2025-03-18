const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

/**
 * 读取模块文件，通过遍历ast收集依赖，再将ast转成代码，最后输出目标代码、收集的依赖、当前文件路径
 * @param {*} file 
 * @returns 
 */
const getModuleInfo = (file) => {
  // 读取入口文件
  const body = fs.readFileSync(file, 'utf-8')
  // 解析成ast
  const ast = parser.parse(body, {
    // 被解析文件的类型
    sourceType: 'module'
  })

  const deps = {}
  // 遍历ast 收集依赖
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file)
      const absPath = path.resolve(dirname, node.source.value)
      deps[node.source.value] = absPath
    }
  })

  // 将ast转成目标代码
  const { code } = babel.transformFromAst(ast, {
    presets: ['@babel/preset-env']
  })

  const moduleInfo = { file, deps, code }

  return moduleInfo
}

/**
 * 从入口文件开始递归解析依赖，并输出依赖关系图
 * @param {*} entryFile 
 * @returns 
 */
const parseModules = (entryFile) => {
  const entry = getModuleInfo(entryFile)
  const temp = [entry]
  // 依赖关系图，以file路径为key，deps、code为值
  const depsGraph = {}

  // 遍历依赖，解析依赖，获取所有依赖的信息
  for(let i = 0; i < temp.length; i++) {
    const deps = temp[i].deps
    if(deps) {
      for(const key in deps) {
        if(deps.hasOwnProperty(key)) {
          temp.push(getModuleInfo(deps[key]))
        }
      }
    }
  }
  
  // 遍历依赖信息，构建依赖关系图
  temp.forEach(moduleInfo => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code
    }
  })
  console.log(depsGraph)
  return depsGraph
  // console.log(temp)
}

const bundle = (file) => {
  const depsGraph = JSON.stringify(parseModules(file))

  return `(
    function (graph) {
      function require(file) {
        function absRequire(relPath) {
          return require(graph[file].deps[relPath])
        }
        
        const exports = {};
        (function (require, exports, code) {
          eval(code)
        })(absRequire, exports, graph[file].code);
        return exports
      }

      require('${file}')
    }
  )(${depsGraph})`
}

const content = bundle('../demo/src/index.js')

fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', content)

