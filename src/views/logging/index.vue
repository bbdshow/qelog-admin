<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form
        ref="dataForm"
        :model="listQuery"
        :rules="rules"
        label-position="left"
      >
        <el-row :gutter="30">
          <el-col :span="8">
            <el-form-item prop="moduleName">
              <el-select
                v-model="listQuery.moduleName"
                :remote-method="getModuleList"
                filterable
                remote
                class="filter-item"
                placeholder="请选择模块名"
                style="width: 600px"
              >
                <el-option
                  v-for="item in modules"
                  :key="item.id"
                  :label="item.moduleName"
                  :value="item.moduleName"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-form-item prop="dbIndex" width="100px">
              <el-select
                v-model="listQuery.dbIndex"
                class="filter-item"
                placeholder="请选择空间"
              >
                <el-option
                  v-for="(item, index) in [1, 2, 3]"
                  :key="index"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item width="300px">
              <el-input v-model="traceId" placeholder="请输入 TraceID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-button
              class="filter-item"
              style="margin-left: 10px"
              type="primary"
              icon="el-icon-search"
            >
              跟踪查询
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="3">
            <el-date-picker
              v-model="beginTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="开始时间"
            />
          </el-col>
          <el-col :span="3">
            <el-date-picker
              v-model="endTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="结束时间"
            />
          </el-col>
          <el-col :span="2">
            <el-form-item prop="level" width="100px">
              <el-select
                v-model="listQuery.level"
                class="filter-item"
                placeholder="请选择等级"
              >
                <el-option
                  v-for="item in levelSorts"
                  :key="item.index"
                  :label="item.value"
                  :value="item.index"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item width="300px">
              <el-input v-model="listQuery.short" placeholder="请输入短消息" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item width="300px">
              <el-input v-model="listQuery.ip" placeholder="请输入IP" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button
              class="filter-item"
              style="margin-left: 10px"
              type="primary"
              icon="el-icon-search"
            >
              查询
            </el-button>
            <el-button
              class="filter-item"
              style="margin-left: 10px"
              type="info"
              icon="el-icon-search"
            >
              加载更多
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <!-- <el-input
        v-model="listQuery.name"
        placeholder="模块名称"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增
      </el-button> -->
    </div>

    <!-- <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="ID" prop="id" align="center" min-width="120px">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updatedTsSec | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模块名" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.desc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="空间索引" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.dbIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="历史空间索引" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.historyDbIndex }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>

          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table> -->

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="module"
        :rules="rules"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="模块名" prop="name">
          <el-input v-model="module.name" />
        </el-form-item>

        <el-form-item
          v-if="dialogStatus === 'delete'"
          label="确认模块名"
          prop="confrimName"
        >
          <el-input v-model="module.confrimName" />
        </el-form-item>

        <el-form-item
          v-if="dialogStatus != 'delete'"
          label="建议存储空间"
          prop="dbIndex"
          width="110px"
        >
          <el-select
            v-model="module.dbIndex"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in dbState.useState"
              :key="item.index"
              :label="`空间 ${item.index} 已使用  ${item.use}`"
              :value="item.index"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus != 'delete'" label="描述">
          <el-input
            v-model="module.desc"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="handleConfrim(dialogStatus)">
          确认
        </el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  fetchModuleList
  // fetchLoggingList,
  // fetchLoggingTraceID
} from '@/api/qelog'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Logging',
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
        dbIndex: undefined,
        short: undefined,
        level: undefined,
        ip: undefined,
        conditionOne: undefined,
        conditionTwo: undefined,
        conditionThree: undefined,
        beginTsSec: 0,
        endTsSec: 0
      },
      traceId: '',
      beginTime: undefined,
      endTime: undefined,

      levelSorts: [
        { index: -1, value: 'DEBUG' },
        { index: 0, value: 'INFO' },
        { index: 1, value: 'WARN' },
        { index: 2, value: 'ERROR' },
        { index: 3, value: 'DPANIC' },
        { index: 4, value: 'PANIC' },
        { index: 5, value: 'FATAL' }
      ],

      modules: [],
      modulesMap: {},
      dialogFormVisible: false,
      dialogStatus: '',

      rules: {
        moduleName: [
          { required: true, message: '模块名称必填', trigger: 'change' }
        ],

        dbIndex: [
          {
            required: true,
            message: '存储空间必填',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.getModuleList(undefined)
    // this.getList();
  },
  methods: {
    getModuleList(name) {
      fetchModuleList({
        name: name,
        page: 1,
        limit: 50
      }).then((response) => {
        const { list } = response.data
        const modules = []
        const modulesMap = {}
        list.forEach((item) => {
          const val = {
            id: item.id,
            moduleName: item.name,
            dbIndex: item.dbIndex,
            historyDbIndex: item.historyDbIndex
          }
          modulesMap[item.name] = val
          modules.push(val)
        })
        this.modules = modules
        this.modulesMap = modulesMap
      })
    },
    getList() {
      this.listLoading = true
      fetchModuleList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.total = response.data.count
        setTimeout(() => {
          this.listLoading = false
        }, 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetListQuery() {
      this.module = {
        name: '',
        dbIndex: 0,
        desc: ''
      }
    }
  }
}
</script>
