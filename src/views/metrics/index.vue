<template>
  <div class="chart-container">
    <module-list height="100%" width="100%" />
  </div>
</template>

<script>
import ModuleList from './components/ModuleList'

export default {
  name: 'Metrics',
  components: {
    ModuleList
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>

