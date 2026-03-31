<script setup lang="ts">
// App shell — add global state or router-view here
</script>

<template>
  <div class="app-shell">
    <!-- ── Titlebar ─────────────────────────────────────────── -->
    <header class="app-titlebar">
      <span class="app-title">{{ appTitle }}</span>
    </header>

    <!-- ── Main content ─────────────────────────────────────── -->
    <main class="app-main">
      <!-- Replace with <router-view /> when using vue-router -->
      <div class="page-container">
        <div class="card">
          <div class="card-header">Getting Started</div>
          <div class="card-body">
            <p class="text-muted">Edit <code>src/App.vue</code> to begin building your app.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
export default {
  computed: {
    appTitle(): string {
      return 'ElectronTemplate'
    },
  },
}
</script>

<style lang="less">
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-titlebar {
  height: 40px;
  min-height: 40px;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  padding: 0 16px;
  // Enable OS drag to move the window
  -webkit-app-region: drag;
  user-select: none;
}

.app-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.app-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
