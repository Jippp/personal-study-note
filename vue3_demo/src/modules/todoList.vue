<script lang="ts" setup>
import { ref } from 'vue'
import Item from './components/Item.vue'
import type { ItemProps } from './types'

const list = ref<ItemProps[]>([])
const inputVal = ref('')

const handleAdd = () => {
  const prevIdTemp = list.value[list.value.length - 1]?.id ?? 0
  list.value.push({
    label: inputVal.value,
    id: prevIdTemp + 1,
    checked: false,
  })
  // 清空
  inputVal.value = ''
}

const handleDelete = (id: number) => {
  list.value = list.value.filter(item => item.id !== id)
}

const handleEdit = (id: number, newItem: ItemProps) => {
  const target = list.value.find(item => item.id === id)
  if(target) {
    Object.assign(target, newItem)
  }
}

</script>

<template>
  <div class="todo-container">
    <input type="text" v-model="inputVal" class="todo-input">
    <button @click="handleAdd" class="todo-button">confirm</button>

    <ul v-if="list.length" class="todo-list">
      <Item 
        v-for="item in list" 
        :item="item" 
        :key="item.id" 
        :onDelete="handleDelete" 
        :onEdit="handleEdit"
      />
    </ul>
    <div v-else class="no-todo">No Todo.</div>
  </div>
</template>

<style scoped>
.todo-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.todo-input {
  width: calc(100% - 22px);
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.todo-button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.todo-button:hover {
  background-color: #0056b3;
}

.todo-list {
  width: 100%;
  padding: 0;
  margin-top: 20px;
}

.no-todo {
  text-align: center;
  color: #888;
}
</style>