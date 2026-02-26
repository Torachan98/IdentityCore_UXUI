<script setup lang="ts">
import { reactive } from 'vue'
import { type RoleDTO } from '@/api/generated'
import ButtonBase from '@/components/atoms/ButtonBase.vue'
import InputLabel from '@/components/atoms/InputLabel.vue'
import ParagraphLabel from '@/components/atoms/ParagraphLabel.vue'
import { useRoleStore } from '@/store/role/role'

const form = reactive<RoleDTO>({
  name: '',
  description: '',
  value: 1,
})

const roleStore = useRoleStore()

async function handleCreate() {
  //roleStore.setLoading()
  await roleStore.createRole({
    name: form.name ?? '',
    description: form.description ?? '',
    value: form.value,
  })
}
</script>
<template>
  <div class="flex flex-col gap-6 px-6 py-6">
    <div class="flex flex-col gap-1">
      <InputLabel label="Role name" v-model="form.name" />
    </div>

    <div class="flex flex-col gap-1">
      <ParagraphLabel label="Description" v-model="form.description" />
    </div>

    <div class="flex flex-col gap-1">
      <InputLabel label="Level" v-model="form.value" type="number" min="1" max="999" />
    </div>

    <div class="flex justify-end gap-3 mt-8">
      <ButtonBase class="px-2" @click="handleCreate">Create</ButtonBase>
    </div>
  </div>
</template>
