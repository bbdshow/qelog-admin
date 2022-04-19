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
      <el-table-column label="Bucket" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.bucket }}</span>
        </template>
      </el-table-column>
      <el-table-column label="间隔(天)" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.daySpan === 0 ? 31 : row.daySpan }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最长存储(月)" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.maxMonth === 0 ? "永久" : row.maxMonth }}</span>
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
        label-width="150"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="模块名" prop="name">
          <el-input v-model="module.name" placeholder="设置接入项目的名称"/>
        </el-form-item>

        <el-form-item
          v-if="dialogStatus === 'delete'"
          label="确认模块名"
          prop="confrimName"
        >
          <el-input v-model="module.confrimName" />
        </el-form-item>

        <el-form-item
          v-if="dialogStatus !== 'delete'"
          label="时间分片(天)"
          prop="daySpan"
        >
          <el-input
            v-model="module.daySpan"
            placeholder="日志根据时间分片,X/天,最大31天, 默认31天"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogStatus !== 'delete'"
          label="最长存储(月)"
          prop="maxMonth"
        >
          <el-input
            v-model="module.maxMonth"
            placeholder="最长存储时间,默认永久"
          />
        </el-form-item>

        <el-form-item
          v-if="dialogStatus == 'update'"
          label="集合前缀(谨慎修改)"
          prop="prefix"
          label-width="100"
        >
          <el-input
            v-model="module.prefix"
            placeholder="存储集合前缀,修改后,老数据必需指定集合查询"
          />
        </el-form-item>

        <el-form-item
          v-if="dialogStatus == 'update'"
          label="Bucket(谨慎修改)"
          prop="bucket"
          label-width="100"
        >
          <el-input
            v-model="module.bucket"
            placeholder="存储仓库，修改后,老数据必需指定此BUCKET关联的数据库查询"
          />
        </el-form-item>

        <el-form-item
          v-if="dialogStatus == 'update'"
          label="存储数据库(谨慎修改)"
          prop="database"
          label-width="100"
        >
          <el-input
            v-model="module.database"
            placeholder="数据库，修改后,老数据必需指定数据库查询"
          />
        </el-form-item>

        <el-form-item v-if="dialogStatus != 'delete'" label="描述">
          <el-input
            v-model="module.desc"
            :autosize="{ minRows: 1, maxRows: 2 }"
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
      module: {
        id: undefined,
        name: "",
        daySpan: 0,
        maxMonth: 0,
        desc: "",
        confrimName: undefined,
        bucket: undefined,
        database: undefined,
        prefix: undefined,
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
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const moduleReq = {
            name: this.module.name,
            daySpan: Number(this.module.daySpan),
            maxMonth: Number(this.module.maxMonth),
            desc: this.module.desc,
          };
          createModule(moduleReq).then(() => {
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
      this.module = Object.assign({}, row); // copy obj
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const moduleReq = {
            id: this.module.id,
            bucket: this.module.bucket,
            daySpan: Number(this.module.daySpan),
            maxMonth: Number(this.module.maxMonth),
            database: this.module.database,
            prefix: this.module.prefix,
            desc: this.module.desc,
          };
          updateModule(moduleReq).then(() => {
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
