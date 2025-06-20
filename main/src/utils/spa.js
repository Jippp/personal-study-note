import { registerApplication, start } from 'single-spa'

export function registerMicro(microApps) {
  // window.__DEV__ = true
  // 批量注册
  microApps.forEach(registerApplication)
  // 启动
  start()
}