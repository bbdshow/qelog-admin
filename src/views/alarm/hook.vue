<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="名称"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.keyWord"
        placeholder="关键字"
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

      <el-table-column label="名称" min-width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="通知方式" min-width="100px" align="center">
        <template slot-scope="{ row }">
          <span> {{ sortsFilter(row.method, "methodSorts") }}</span>
        </template>
      </el-table-column>

      <el-table-column label="关键字" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.keyWord }}</span>
        </template>
      </el-table-column>

      <el-table-column label="URL" width="300px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.url }}</span>
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
          <el-button type="success" size="mini" @click="pingHookURL(row.id)">
            PING
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
        :model="hookUrl"
        :rules="dialogStatus !== 'delete' ? rules : {}"
        :disabled="dialogStatus === 'delete'"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="hookUrl.name"
            :disabled="dialogStatus != 'create'"
          />
        </el-form-item>

        <el-form-item label="通知方式" prop="method" width="110px">
          <el-select
            v-model="hookUrl.method"
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

        <el-form-item label="HookURL" prop="url">
          <el-input v-model="hookUrl.url" />
        </el-form-item>
        <el-form-item label="关键字" prop="keyWord">
          <el-input v-model="hookUrl.keyWord" />
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
  fetchHookURLList,
  createHookURL,
  updateHookURL,
  deleteHookURL,
  pingHookURL,
} from "@/api/qelog";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "Hook",
  components: { Pagination },
  filters: {
    enableFilter(enable) {
      return enable ? "success" : "danger";
    },
  },

  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        id: undefined,
        page: 1,
        limit: 20,
        name: "",
        keyWord: "",
      },
      methodSorts: [{ index: 1, value: "DingDing" }],
      hookUrl: {
        id: undefined,
        name: "",
        keyWord: "",
        method: 1,
        url: "",
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
          {
            required: true,
            message: "name is required",
            trigger: "change",
          },
        ],
        url: [
          {
            required: true,
            message: "url is required",
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
    sortsFilter(v, typ) {
      const sorts = this[typ];
      if (sorts) {
        for (let i = 0; i < sorts.length; i++) {
          const { index, value } = sorts[i];
          if (index === v) {
            return value;
          }
        }
      }
    },
    getList() {
      this.listLoading = true;
      fetchHookURLList(this.listQuery).then((response) => {
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
    resetHookURL() {
      this.hookUrl = {
        id: undefined,
        name: "",
        keyWord: "",
        method: 1,
        url: "",
      };
    },
    pingHookURL(id) {
      if (id) {
        pingHookURL({ id: id }).then(() => {
          this.$notify({
            title: "Success",
            type: "success",
            duration: 2000,
          });
        });
      }
    },
    handleCreate() {
      this.resetHookURL();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          createHookURL(this.hookUrl).then(() => {
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
      this.hookUrl = Object.assign({}, row); // copy obj
      console.log(this.hookUrl);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          updateHookURL(this.hookUrl).then(() => {
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
      this.hookUrl = Object.assign({}, row); // copy obj
      this.dialogStatus = "delete";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    deleteData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          deleteHookURL({
            id: this.hookUrl.id,
          }).then(() => {
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
