import express from 'express'

const app = express()

app.get('/info/:id', (req, res) => {
  const delay = Math.floor(Math.random() * 2000) + 1000; // 1~3 秒随机延迟
  const id = req.params.id;

  // console.log(`→ 接收到请求 ${id}，预计延迟 ${delay}ms`);

  setTimeout(() => {
    // console.log(`← 响应请求 ${id}`);
    res.json({ id, delay });
  }, delay);
})

app.listen(5011, () => {
  console.log(`Server is running in 5011 port`)
})
