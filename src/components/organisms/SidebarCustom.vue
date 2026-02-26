<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { toast } from 'vue3-toastify'

import SidebarItem from '@/components/molecules/SidebarItem.vue'
import Icon from '@/components/atoms/IconBase.vue'
import UserGreeting from '@/components/molecules/UserGreeting.vue'

import { useAuthStore } from '@/store/auth/auth'
import type { BooleanApiResponse } from '@/api/generated'

interface Props {
  firstName: string
  lastName: string
  collapsed: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isActive = (path: string): boolean => {
  return route.path.startsWith(path)
}

const toggleSidebar = (): void => {
  emit('toggle')
}

const goTo = (path: string): void => {
  router.replace(path)
}

const handleSignOut = async (): Promise<void> => {
  const res = (await authStore.signOut()) as BooleanApiResponse

  if (res.isSuccess && res.data) {
    router.replace('/login')
    return
  }

  toast.error(res.message)
}
</script>

<template>
  <aside
    class="h-screen border-r bg-white transition-all duration-300"
    :class="props.collapsed ? 'w-16' : 'w-64'"
  >
    <div class="flex justify-end px-3 py-2">
      <button class="rounded-md p-1 hover:bg-gray-100 cursor-pointer" @click="toggleSidebar">
        <FontAwesomeIcon icon="bars" />
      </button>
    </div>

    <UserGreeting
      :first-name="props.firstName"
      :last-name="props.lastName"
      :collapsed="props.collapsed"
    />

    <nav class="space-y-1 px-2">
      <SidebarItem
        :active="isActive('/users')"
        label="Users"
        :collapsed="false"
        @click="goTo('/users')"
      >
        <template #icon>
          <Icon>
            <FontAwesomeIcon icon="user-gear" />
          </Icon>
        </template>
      </SidebarItem>

      <SidebarItem
        :active="isActive('/permissions')"
        label="Permissions"
        :collapsed="false"
        @click="goTo('/permissions')"
      >
        <template #icon>
          <Icon>
            <FontAwesomeIcon icon="person-praying" />
          </Icon>
        </template>
      </SidebarItem>

      <SidebarItem
        :active="isActive('/roles')"
        label="Roles"
        :collapsed="false"
        @click="goTo('/roles')"
      >
        <template #icon>
          <Icon>
            <FontAwesomeIcon icon="person-military-rifle" />
          </Icon>
        </template>
      </SidebarItem>

      <SidebarItem
        :active="isActive('/services')"
        label="Services"
        :collapsed="false"
        @click="goTo('/services')"
      >
        <template #icon>
          <Icon>
            <FontAwesomeIcon icon="screwdriver-wrench" />
          </Icon>
        </template>
      </SidebarItem>

      <SidebarItem
        label="Sign out"
        :active="false"
        :collapsed="props.collapsed"
        @click="handleSignOut"
      >
        <template #icon>
          <Icon>
            <FontAwesomeIcon icon="arrow-right-from-bracket" />
          </Icon>
        </template>
      </SidebarItem>
    </nav>
  </aside>
</template>
