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
      :key="0"
      v-loading="listLoading"
      :data="dbList"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="更新时间" width="135px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.updatedTsSec | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="HOST" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.host }}</span>
        </template>
      </el-table-column>
      <el-table-column label="DB" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.dbName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据总大小" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ calcSize(row.dataSize).number.toFixed(3) }}</span>
          <span>{{ calcSize(row.dataSize).unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="存储总大小" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ calcSize(row.storageSize).number.toFixed(3) }}</span>
          <span>{{ calcSize(row.storageSize).unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="索引总大小" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ calcSize(row.indexSize).number.toFixed(3) }}</span>
          <span>{{ calcSize(row.indexSize).unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文档总条数" width="120px" align="center">
        <template slot-scope="{ row }">
          <span>{{ calcNum(row.objects).number.toFixed(3) }}</span>
          <span>{{ calcNum(row.objects).unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="集合总数" width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.collections }}</span>
        </template>
      </el-table-column>
      <el-table-column label="索引总数" width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.indexs }}</span>
        </template>
      </el-table-column>
    </el-table>

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
        <template slot-scope="{ row }">
          <el-button
            type="primary"
            size="mini"
            @click="handlerCollMetrics(row.name)"
          >
            集合容量
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

    <el-dialog title="集合容量" :visible.sync="dialogFormVisible" width="90%">
      <el-table
        :key="1"
        v-loading="listLoading"
        :data="collList"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column label="时间" width="135px" align="center">
          <template slot-scope="{ row }">
            <span>{{
              row.createdTsSec | parseTime("{y}-{m}-{d} {h}:{i}")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="集合" width="200px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数据总大小" width="120px" align="center">
          <template slot-scope="{ row }">
            <span>{{ calcSize(row.size).number.toFixed(3) }}</span>
            <span>{{ calcSize(row.size).unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="存储总大小" width="120px" align="center">
          <template slot-scope="{ row }">
            <span>{{ calcSize(row.storageSize).number.toFixed(3) }}</span>
            <span>{{ calcSize(row.storageSize).unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均对象大小" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{ calcSize(row.avgObjSize).number.toFixed(3) }}</span>
            <span>{{ calcSize(row.avgObjSize).unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="索引总大小" width="120px" align="center">
          <template slot-scope="{ row }">
            <span>{{ calcSize(row.totalIndexSize).number.toFixed(3) }}</span>
            <span>{{ calcSize(row.totalIndexSize).unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="索引大小分布" align="center">
          <template slot-scope="{ row }">
            <div v-for="(v, k) in row.indexSizes" :key="k">
              <span>名称:{{ k }} =></span>
              <span>大小:{{ calcSize(v).number.toFixed(3) }}</span>
              <span>{{ calcSize(v).unit }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="文档总条数" width="120px" align="center">
          <template slot-scope="{ row }">
            <span>{{ calcNum(row.count).number.toFixed(3) }}</span>
            <span>{{ calcNum(row.count).unit }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="150"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{ row }">
            <el-popconfirm
              confirm-button-text="确认删除"
              cancel-button-text="取消"
              icon="el-icon-info"
              icon-color="red"
              :title="`您确定删除 ${row.name} 集合吗？删除操作不可逆`"
              @onConfirm="deleteColl(row)"
            >
              <el-button slot="reference" type="danger">删除集合</el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchMetricsDBStats,
  fetchMetricsCollStats,
  deleteLoggingCollection,
  fetchModuleList,
} from "@/api/qelog";
import { calcNum, calcSize } from "@/utils/calc";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

export default {
  name: "DBStats",
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: false,
      collList: null,
      listQuery: {
        page: 1,
        limit: 20,
        moduleName: undefined,
      },
      dbList: null,
      dialogFormVisible: false,
    };
  },
  created() {
    this.getMetricsDBStat();
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
    getMetricsDBStat() {
      this.listLoading = true;
      fetchMetricsDBStats().then((response) => {
        this.dbList = response.data.list;
        this.listLoading = false;
      });
    },
    handlerCollMetrics(name) {
      this.listLoading = true;
      fetchMetricsCollStats({ moduleName: name }).then((response) => {
        this.collList = response.data.list;
        this.dialogFormVisible = true;
        // console.log(this.collList);
      });
      setInterval(() => {
        this.listLoading = false;
      }, 500);
    },
    deleteColl(row) {
      deleteLoggingCollection({
        moduleName: row.moduleName,
        collection: row.name,
      }).then((response) => {
        this.$notify({
          title: "Success",
          message: "删除成功",
          type: "success",
          duration: 2000,
        });
        this.handlerCollMetrics(row.moduleName);
      });
    },

    calcSize(val) {
      return calcSize(val);
    },
    calcNum(val) {
      return calcNum(val);
    },
  },
};
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
