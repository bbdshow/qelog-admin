<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.moduleName"
        placeholder="模块名称"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.short"
        placeholder="短消息"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <el-select
        v-model="listQuery.enable"
        class="filter-item"
        placeholder="状态"
      >
        <el-option
          v-for="item in enableSorts"
          :key="item.index"
          :label="item.value"
          :value="item.index"
        />
      </el-select>

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
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updatedTsSec | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" prop="enabel" align="center" width="100px">
        <template slot-scope="{ row }">
          <el-tag :type="row.enable | enableFilter">
            {{ row.enable }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="短消息" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.short }}</span>
        </template>
      </el-table-column>

      <el-table-column label="等级" prop="enabel" align="center" width="100px">
        <template slot-scope="{ row }">
          {{ sortsFilter(row.level, "levelSorts") }}
        </template>
      </el-table-column>

      <el-table-column label="标签" min-width="50px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.tag }}</span>
        </template>
      </el-table-column>

      <el-table-column label="频率" min-width="50px" align="center">
        <template slot-scope="{ row }">
          <span>{{ "1/" + row.rateSec + "s" }}</span>
        </template>
      </el-table-column>

      <el-table-column label="通知方式" min-width="50px" align="center">
        <template slot-scope="{ row }">
          <span> {{ sortsFilter(row.method, "methodSorts") }}</span>
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
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :model="alarmRule"
        :rules="dialogStatus !== 'delete' ? rules : {}"
        :disabled="dialogStatus === 'delete'"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="模块名" prop="moduleName">
          <el-input
            v-model="alarmRule.moduleName"
            :disabled="dialogStatus != 'create'"
          />
        </el-form-item>
        <el-form-item label="短消息" prop="short">
          <el-input v-model="alarmRule.short" />
        </el-form-item>

        <el-form-item label="等级" prop="level" min-width="80px">
          <el-select
            v-model="alarmRule.level"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in levelSorts"
              :key="item.index"
              :label="item.value"
              :value="item.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="通知方式" prop="method" width="110px">
          <el-select
            v-model="alarmRule.method"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in methodSorts"
              :key="item.index"
              :label="item.value"
              :value="item.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="HookURL" prop="hookUrl">
          <el-input v-model="alarmRule.hookUrl" />
        </el-form-item>
        <el-form-item label="频率间隔(秒)" prop="rateSec">
          <el-input v-model="alarmRule.rateSec" />
        </el-form-item>
        <el-form-item
          v-if="dialogStatus == 'update'"
          label="关闭/启动"
          prop="enable"
        >
          <el-switch
            v-model="alarmRule.enable"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>

        <el-form-item label="标签" prop="tag">
          <el-input v-model="alarmRule.tag" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="handleConfrim(dialogStatus)">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchAlarmRuleList,
  createAlarmRule,
  updateAlarmRule,
  deleteAlarmRule
} from '@/api/qelog'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'Alarm',
  components: { Pagination },
  filters: {
    enableFilter(enable) {
      return enable ? 'success' : 'danger'
    }
  },

  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        moduleName: '',
        enable: -1,
        short: ''
      },
      enableSorts: [
        { index: -1, value: '状态' },
        { index: 0, value: '关闭' },
        { index: 1, value: '开启' }
      ],
      levelSorts: [
        { index: -2, value: 'Unknown' },
        { index: -1, value: 'DEBUG' },
        { index: 0, value: 'INFO' },
        { index: 1, value: 'WARN' },
        { index: 2, value: 'ERROR' },
        { index: 3, value: 'DPANIC' },
        { index: 4, value: 'PANIC' },
        { index: 5, value: 'FATAL' }
      ],
      methodSorts: [
        { index: 0, value: 'Unknown' },
        { index: 1, value: 'DingDing' }
      ],
      alarmRule: {
        id: undefined,
        moduleName: '',
        short: '',
        level: 0,
        tag: '',
        rateSec: 30,
        method: 1,
        hookUrl: '',
        enabel: -1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建',
        delete: '删除'
      },
      rules: {
        moduleName: [
          {
            required: true,
            message: 'moduleName is required',
            trigger: 'change'
          }
        ],
        short: [
          {
            required: true,
            message: 'short is required',
            trigger: 'change'
          }
        ],
        level: [
          {
            required: true,
            message: 'level is required',
            trigger: 'change'
          }
        ],
        method: [
          {
            required: true,
            message: 'method is required',
            trigger: 'change'
          }
        ],
        hookUrl: [
          {
            required: true,
            message: 'hookUrl is required',
            trigger: 'change'
          }
        ],
        rateSec: [
          {
            type: 'number',
            required: true,
            message: 'rateSec is required',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    sortsFilter(v, typ) {
      const sorts = this[typ]
      if (sorts) {
        for (let i = 0; i < sorts.length; i++) {
          const { index, value } = sorts[i]
          if (index === v) {
            return value
          }
        }
      }
    },
    getList() {
      this.listLoading = true
      fetchAlarmRuleList(this.listQuery).then((response) => {
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
    resetAlarmRule() {
      this.alarmRule = {
        id: undefined,
        moduleName: '',
        short: '',
        level: -1,
        tag: '',
        rateSec: 30,
        method: 1,
        hookUrl: '',
        enabel: true
      }
    },
    handleCreate() {
      this.resetAlarmRule()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createAlarmRule(this.alarmRule).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '新增成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.alarmRule = Object.assign({}, row) // copy obj
      console.log(this.alarmRule)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateAlarmRule(this.alarmRule).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '编辑成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.alarmRule = Object.assign({}, row) // copy obj
      this.dialogStatus = 'delete'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    deleteData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          deleteAlarmRule({
            id: this.alarmRule.id
          }).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleConfrim(dialogStatus) {
      switch (dialogStatus) {
        case 'create':
          return this.createData()
        case 'update':
          return this.updateData()
        case 'delete':
          return this.deleteData()
      }
    }
  }
}
</script>
