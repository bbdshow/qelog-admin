<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
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
      </el-button>
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
      <el-table-column label="分片索引" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.shardingIndex }}</span>
        </template>
      </el-table-column>
      <el-table-column label="历史分片索引" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.historyShardingIndex }}</span>
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
          prop="shardingIndex"
          width="110px"
        >
          <el-select
            v-model="module.shardingIndex"
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
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchModuleList,
  fetchShardingIndex,
  createModule,
  updateModule,
  deleteModule,
} from "@/api/qelog";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "Module",
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
        name: undefined,
      },
      dbState: {
        useState: [],
      },
      module: {
        id: undefined,
        name: "",
        shardingIndex: 0,
        desc: "",
        confrimName: undefined,
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "创建",
        delete: "删除",
      },
      rules: {
        name: [
          { required: true, message: "name is required", trigger: "change" },
        ],
        confrimName: [
          {
            required: true,
            message: "confrimName is required",
            trigger: "change",
          },
        ],
        shardingIndex: [
          {
            required: true,
            message: "shardingIndex is required",
            trigger: "change",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchModuleList(this.listQuery).then((response) => {
        this.list = response.data.list;
        this.total = response.data.count;
        setTimeout(() => {
          this.listLoading = false;
        }, 500);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    resetModule() {
      this.module = {
        id: undefined,
        name: "",
        shardingIndex: 0,
        desc: "",
      };
    },
    handleCreate() {
      this.resetModule();
      fetchShardingIndex().then((response) => {
        this.dbState = response.data;
        this.module.shardingIndex = this.dbState.suggestIndex;
        this.dialogStatus = "create";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          createModule(this.module).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "新增成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row) {
      fetchShardingIndex().then((response) => {
        this.dbState = response.data;
        this.module = Object.assign({}, row); // copy obj
        this.dialogStatus = "update";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const moduleData = {
            id: this.module.id,
            shardingIndex: this.module.shardingIndex,
            desc: this.module.desc,
          };
          updateModule(moduleData).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "编辑成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      this.module.id = row.id;
      this.dialogStatus = "delete";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    deleteData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const moduleData = {
            id: this.module.id,
            name: this.module.confrimName,
          };
          console.log(moduleData);
          deleteModule(moduleData).then(() => {
            this.getList();
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "删除成功",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleConfrim(dialogStatus) {
      switch (dialogStatus) {
        case "create":
          return this.createData();
        case "update":
          return this.updateData();
        case "delete":
          return this.deleteData();
      }
    },
  },
};
</script>
