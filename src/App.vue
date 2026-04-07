<script setup lang="ts">
// App shell — add global state or router-view here
</script>

<template>
  <div class="app-shell">
    <!-- ── Titlebar (Apple-style translucent nav) ───────────── -->
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
  height: 48px;                          // Apple nav height
  min-height: 48px;
  background: var(--color-nav-bg);       // rgba(0,0,0,0.8) translucent glass
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: none;                   // Apple nav has no border
  display: flex;
  align-items: center;
  padding: 0 var(--space-8);             // 0 32px — Apple uses generous nav padding
  -webkit-app-region: drag;
  user-select: none;
}

.app-title {
  font-family: var(--font-text);
  font-size: 0.875rem;   // 14px
  font-weight: 600;
  letter-spacing: -0.224px;
  color: rgba(255, 255, 255, 0.9);       // White text on dark glass nav
}

.app-main {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
