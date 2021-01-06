<template>
  <div>
    <el-row :gutter="20" class="panel-group">
      <el-col :xs="8" :sm="8" :lg="4" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-description">
            <div class="card-panel-text">数据总大小</div>
            <count-to
              :start-val="0"
              :end-val="calcSize(counts.dbCount.dataSize).number"
              :duration="2000"
              class="card-panel-num"
            />
            {{ calcSize(counts.dbCount.dataSize).unit }}
          </div>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :lg="4" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-description">
            <div class="card-panel-text">存储总大小</div>
            <count-to
              :start-val="0"
              :end-val="calcSize(counts.dbCount.storageSize).number"
              :duration="2000"
              class="card-panel-num"
            />
            {{ calcSize(counts.dbCount.storageSize).unit }}
          </div>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :lg="4" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-description">
            <div class="card-panel-text">索引总大小</div>
            <count-to
              :start-val="0"
              :end-val="calcSize(counts.dbCount.indexSize).number"
              :duration="2000"
              class="card-panel-num"
            />
            {{ calcSize(counts.dbCount.indexSize).unit }}
          </div>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :lg="4" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-description">
            <div class="card-panel-text">文档总条数</div>
            <count-to
              :start-val="0"
              :end-val="calcNum(counts.dbCount.objects).number"
              :duration="3600"
              class="card-panel-num"
            />
            {{ calcNum(counts.dbCount.objects).unit }}
          </div>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :lg="4" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-description">
            <div class="card-panel-text">集合总数</div>
            <count-to
              :start-val="0"
              :end-val="calcNum(counts.dbCount.collections).number"
              :duration="3600"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
      <el-col :xs="8" :sm="8" :lg="4" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-description">
            <div class="card-panel-text">索引总数</div>
            <count-to
              :start-val="0"
              :end-val="calcNum(counts.dbCount.indexs).number"
              :duration="3600"
              class="card-panel-num"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { fetchMetricsCount } from '@/api/qelog'
import CountTo from 'vue-count-to'
import { calcNum, calcSize } from '@/utils/calc'

export default {
  name: 'Count',
  components: {
    CountTo
  },
  data() {
    return {
      counts: {
        dbCount: {
          collections: 0,
          dataSize: 0,
          storageSize: 0,
          indexSize: 0,
          objects: 0,
          indexs: 0
        },
        moduleCount: {
          modules: 0,
          numbers: 0,
          loggingSize: 0
        }
      }
    }
  },
  created() {
    this.getMetricsCount()
  },
  methods: {
    getMetricsCount() {
      fetchMetricsCount().then((response) => {
        this.counts = response.data
      })
    },
    calcSize(val) {
      return calcSize(val)
    },
    calcNum(val) {
      return calcNum(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.header-title {
  margin-top: 18px;
  padding-left: 18px;
  background-color: #fff;
  color: #666;
}

.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 88px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);

    .card-panel-description {
      line-height: 50px;
      font-weight: bold;
      margin-top: 10px;
      text-align: center;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
