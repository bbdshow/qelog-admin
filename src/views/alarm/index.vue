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
      <el-table-column label="模块名" prop="moduleName" align="center" width="150px">
        <template slot-scope="{ row }">
          <span>{{ row.moduleName }}</span>
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
      <el-table-column label="HookURL" min-width="50px" align="center">
        <template slot-scope="{ row }">
          <!-- <span>{{ row.hookId !='' ? hooksMap[row.hookId]['name']: '' }}</span> -->
          <span>{{ hookNameFilter(row.hookId) }}</span>
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
          <el-select
            v-model="alarmRule.moduleName"
            filterable
            class="filter-item"
            placeholder="请选择模块名"
            style="width: 100%"
            :disabled="dialogStatus != 'create'"
          >
            <el-option
              v-for="item in modules"
              :key="item.id"
              :label="item.moduleName"
              :value="item.moduleName"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="短消息" prop="short">
          <el-input v-model="alarmRule.short" placeholder="日志信息短消息头"/>
        </el-form-item>

        <el-form-item label="等级" prop="level" min-width="80px">
          <el-select
            v-model="alarmRule.level"
            class="filter-item"
            placeholder="请选择"
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
            placeholder="请选择"
            @change="fetchHookURLList"
          >
            <el-option
              v-for="item in methodSorts"
              :key="item.index"
              :label="item.value"
              :value="item.index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="HookURL">
          <el-select
            v-model="alarmRule.hookId"
            filterable
            class="filter-item"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in hooks"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="频率间隔(秒)" prop="rateSec">
          <el-input-number v-model="alarmRule.rateSec" />
          <el-popover
              placement="top-start"
              title="频率规则"
              width="400"
              trigger="hover">
               <p>间隔多少秒发送1条,例如30,则每个receiver实例同一短消息30秒内只发送1条</p>
               <p>数值 0 : 每条都发送</p>
              <el-button slot="reference" icon="el-icon-question" circle type="text" ></el-button>
          </el-popover>
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

        <el-form-item label="标签(选填)" prop="tag">
          <el-input v-model="alarmRule.tag" placeholder="可通过报警信息快速明确分组" />
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
  deleteAlarmRule,
  fetchHookURLList,
  fetchModuleList
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
        { index: -1, value: 'DEBUG' },
        { index: 0, value: 'INFO' },
        { index: 1, value: 'WARN' },
        { index: 2, value: 'ERROR' },
        { index: 3, value: 'DPANIC' },
        { index: 4, value: 'PANIC' },
        { index: 5, value: 'FATAL' }
      ],
      methodSorts: [
        { index: 1, value: 'DingDing' },
        { index: 2, value: 'Telegram' }
      ],
      alarmRule: {
        id: undefined,
        moduleName: '',
        short: '',
        level: 0,
        tag: '',
        rateSec: 30,
        method: '',
        hookId: '',
        enabel: -1
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建',
        delete: '删除'
      },
      hooks: [],
      hooksMap: {},
      modules: [],
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
        hookId: [
          {
            required: true,
            message: 'hookId is required',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.fetchHookURLList()
    this.fetchModuleList()
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
    hookNameFilter(id) {
      if (id && this.hooksMap) {
        const hooks = this.hooksMap[id]
        if (hooks) {
          return hooks.name
        }
      }
      return ''
    },
    getList() {
      this.listLoading = true
      fetchAlarmRuleList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.total = response.data.count
        setTimeout(() => {
          this.listLoading = false
        }, 500)
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
        method: '',
        hookId: '',
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
    fetchHookURLList() {
      fetchHookURLList({
        method: this.alarmRule.method || 0,
        page: 1,
        limit: 50
      }).then((response) => {
        this.listLoading = false
        const { list } = response.data
        const hooks = []
        const hooksMap = {}
        list.forEach((item) => {
          const val = {
            id: item.id,
            name: item.name,
            url: item.url,
            method: item.method
          }
          hooksMap[item.id] = val
          hooks.push(val)
        })
        this.hooks = hooks
        this.hooksMap = hooksMap
        this.alarmRule.hookId = ""
      })
    },
    fetchModuleList() {
      fetchModuleList({
        page: 1,
        limit: 150
      }).then((response) => {
        this.listLoading = false
        const { list } = response.data
        const modules = []
        list.forEach((item) => {
          const val = {
            id: item.id,
            moduleName: item.name
          }
          modules.push(val)
        })
        this.modules = modules
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
