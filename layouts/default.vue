<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <slot />
    </div>
  </div>
</template>
