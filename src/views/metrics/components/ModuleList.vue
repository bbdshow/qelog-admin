<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row :gutter="30">
        <el-col :span="4">
          <el-input
            v-model="listQuery.name"
            placeholder="模块名称"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="dateTime"
            type="date"
            format="yyyy-MM-dd HH:mm:ss"
            placeholder="日期"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="4">
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
          >
            搜索
          </el-button>
        </el-col>
      </el-row>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="时间" width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.createdTsSec | parseTime("{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模块名">
        <template slot-scope="{ row }">
          <span>{{ row.moduleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="写入日志条数" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="写入日志大小" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ calcSize(row.size).number.toFixed(2) }}</span>
          <span>{{ calcSize(row.size).unit }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            @click="handlerTrendMetrics(row.moduleName)"
          >
            趋势
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog title="写入趋势" :visible.sync="dialogFormVisible" width="90%">
      <el-row :gutter="40">
        <el-col :span="4">
          <el-select
            v-model="trendQuery.lastDay"
            clearable
            class="filter-item"
            placeholder="选天数"
          >
            <el-option
              v-for="item in [1, 2, 3, 4, 5, 6, 7]"
              :key="item"
              :label="item + '天'"
              :value="item"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handlerTrendMetrics(null)">
            查询
          </el-button>
        </el-col>
      </el-row>
      <div class="chart-container" style="margin-top: 10px">
        <chart width="100%" height="100%" :show-data="trendData" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchMetricsModuleList, fetchMetricsModuleTrend } from '@/api/qelog'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Chart from './Chart'
import { calcSize } from '@/utils/calc'
import { dateTime } from '@/utils/select'

export default {
  name: 'ModuleList',
  components: {
    Pagination,
    Chart
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        moduleName: undefined,
        dateTsSec: 0
      },
      trendQuery: {
        moduleName: undefined,
        lastDay: 1
      },
      trendData: null,
      dateTime: dateTime,
      dialogFormVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      if (this.dateTime) {
        this.listQuery.dateTsSec = Math.ceil(this.dateTime.getTime() / 1e3)
      } else {
        this.$notify({
          title: '参数异常',
          message: '时间必传',
          type: 'error',
          duration: 2000
        })
        return
      }
      this.listLoading = true
      fetchMetricsModuleList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.total = response.data.count
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handlerTrendMetrics(moduleName) {
      this.trendQuery.moduleName =
        moduleName == null ? this.trendQuery.moduleName : moduleName
      if (moduleName) {
        this.trendQuery.lastDay = 1
      }
      fetchMetricsModuleTrend(this.trendQuery).then((response) => {
        this.trendData = response.data
        this.dialogFormVisible = true
      })
    },
    calcTrendList() {},
    calcSize(val) {
      return calcSize(val)
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
.chart-dialog {
  width: 90%;
}
</style>
