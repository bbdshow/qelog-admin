<template>
  <div class="chart-container">
    <count height="100%" width="100%" />

    <module-list height="100%" width="100%" />
  </div>
</template>

<script>
import ModuleList from './components/ModuleList'
import Count from './components/Count'

export default {
  name: 'Metrics',
  components: {
    Count,
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

