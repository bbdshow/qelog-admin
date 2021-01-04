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
        <template slot-scope="{}">
          <el-button type="primary" size="mini"> 趋势 </el-button>
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
  </div>
</template>

<script>
import { fetchMetricsModuleList } from '@/api/qelog'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ModuleList',
  components: { Pagination },
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
      dateTime: new Date()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.listQuery.dateTsSec = Math.ceil(this.dateTime.getTime() / 1e3)

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
    calcSize(val) {
      let divCount = 0
      for (; val > 1024;) {
        divCount++
        val = val / 1024
        if (divCount >= 2) {
          break
        }
      }
      switch (divCount) {
        case 0:
          return { number: val, unit: 'B' }
        case 1:
          return { number: val, unit: 'KB' }
        case 2:
          return { number: val, unit: 'MB' }
      }
    }
  }
}
</script>
