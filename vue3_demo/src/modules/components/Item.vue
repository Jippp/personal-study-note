<script lang="ts" setup>
import { ref } from 'vue'
import type { ItemProps } from '@/modules/types'

interface IProps {
  item: ItemProps;
  onDelete: (id: number) => void;
  onEdit: (id: number, newInfo: ItemProps) => void
}

const { item, onDelete, onEdit } = defineProps<IProps>()
const isEditing = ref(false)
const newItemLabel = ref<ItemProps['label']>(item.label)

const handleEdit = () => {
  isEditing.value = true
}
const handleConfirmEdit = () => {
  onEdit(item.id, { ...item, label: newItemLabel.value })
  isEditing.value = false
}

</script>

<template>
  <li class="item-base">
    <div>
      <input type="checkbox" v-model="item.checked">
      <span 
        v-show="!isEditing"
        :class="{
          'item-checked': item.checked
        }"
      >{{ item.label }}</span>
      <input v-show="isEditing" type="text" v-model="newItemLabel">
    </div>
    <div class="button-group">
      <button v-if="!isEditing" @click="handleEdit" class="item-button item-edit-button">edit</button>
      <button v-else @click="handleConfirmEdit" class="item-button item-confirm-button">ok</button>
      <button @click="() => onDelete(item.id)" class="item-button item-delete-button">del</button>
    </div>
  </li>
</template>

<style lang="less" scoped>
.item-base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #ddd;
  color: #333;
  transition: box-shadow 0.3s, background-color 0.3s;
  margin-bottom: 10px;
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    background-color: #f0f0f0;
  }
}

.item-base input[type="checkbox"] {
  margin-right: 10px;
}

.item-active {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #e6f7ff;
}

.item-checked {
  text-decoration: line-through;
  color: #999;
}

.button-group {
  display: flex;
  gap: 8px; /* 按钮之间的间距 */
}
.item-button {
  width: 60px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}
.item-edit-button {
  background-color: #ffc107; /* 黄色 */
  color: #fff;

  &:hover {
    background-color: #e0a800;
    transform: scale(1.05); /* 鼠标悬停时微微放大 */
  }
}
.item-confirm-button {
  background-color: #28a745; /* 绿色 */
  color: #fff;

  &:hover {
    background-color: #218838;
    transform: scale(1.05);
  }
}
.item-delete-button {
  background-color: #dc3545; /* 红色 */
  color: #fff;

  &:hover {
    background-color: #c82333;
    transform: scale(1.05);
  }
}

</style>
