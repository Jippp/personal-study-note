import Redis from 'ioredis'

const redis = new Redis()

const initialData = {
  "1702459181837": '{"title":"sunt aut","content":"quia et suscipit suscipit recusandae","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459182837": '{"title":"qui est","content":"est rerum tempore vitae sequi sint","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459188837": '{"title":"ea molestias","content":"et iusto sed quo iure","updateTime":"2023-12-13T09:19:48.837Z"}'
}

const KEY = 'notes'

/** 获取全部数据 */
export async function getAllNotes() {
  const data = await redis.hgetall(KEY)
  if(Object.keys(data).length === 0) {
    await redis.hmset(KEY, initialData)
  }
  return await redis.hgetall(KEY)
}

/** 添加一个数据 */
export async function addNote(data: string) {
  const uuid = Date.now().toString()
  await redis.hset(KEY, { [uuid]: data })
  return uuid
}

/** 更新数据 */
export async function updateNote(uuid: string, newData: string) {
  await redis.hset(KEY, { [uuid]: newData })
}

/** 获取单个数据 */
export async function getNote(uuid: string) {
  return await redis.hget(KEY, uuid)
}

/** 删除单个数据 */
export async function delNote(uuid: string) {
  await redis.hdel(KEY, uuid)
}

export default redis
