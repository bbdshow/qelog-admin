<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form
        ref="dataForm"
        :model="listQuery"
        :rules="rules"
        label-position="left"
      >
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item prop="moduleName">
              <el-select
                v-model="listQuery.moduleName"
                :remote-method="getModuleList"
                filterable
                remote
                class="filter-item"
                placeholder="请选择模块名(可搜索)"
                style="width: 100%"
                @change="resetListQueryFilter"
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
            <el-form-item width="100px">
              <el-input
                v-model="listQuery.forceDatabase"
                placeholder="指定存储库"
              />
            </el-form-item>
          </el-col>
          <el-col :span="3">
            <el-form-item width="100px">
              <el-input
                v-model="listQuery.forceCollectionName"
                placeholder="指定集合"
              />
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item width="300px">
              <el-input v-model="traceId" placeholder="请输入 TraceID" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button
              class="filter-item"
              style="margin-left: 10px"
              type="primary"
              icon="el-icon-search"
              @click="handleTraceID"
            >
              跟踪查询
            </el-button>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="4">
            <el-date-picker
              v-model="beginTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              :picker-options="startTimeSelect"
              placeholder="开始时间"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="4">
            <el-date-picker
              v-model="endTime"
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              :picker-options="endTimeSelect"
              placeholder="结束时间"
              style="width: 100%"
            />
          </el-col>
          <el-col :span="2">
            <el-form-item prop="level" width="100px">
              <el-select
                v-model="listQuery.level"
                clearable
                class="filter-item"
                placeholder="选等级"
                @clear="resetListQueryFilter"
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

          <el-col
            v-if="
              listQuery.level != undefined &&
              listQuery.level !== '' &&
              listQuery.level >= -1
            "
            :span="7"
          >
            <el-form-item width="300px">
              <el-input v-model="listQuery.short" placeholder="请输入短消息" />
            </el-form-item>
          </el-col>
          <el-col v-if="listQuery.short" :span="3">
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
              @click="handleFilter"
            >
              筛选查询
            </el-button>
            <el-popover
                 placement="top-start"
                 title="查询帮助"
                 width="400"
                 trigger="hover">
                  <p>跟踪查询:必需填入TraceID,可查询出所有绑定此ID的日志</p>
                  <p>筛选查询:如需使用查询条件,必需先指定日志等级</p>
                  <p>1.指定等级 2.指定短消息 3.可指定IP 4.筛选条件1,2,3</p>
                 <el-button slot="reference" icon="el-icon-question" circle type="text"></el-button>
            </el-popover>
          </el-col>
        </el-row>
        <el-row v-if="listQuery.short" :gutter="10">
          <el-col :span="8">
            <el-form-item width="300px">
              <el-input
                v-model="listQuery.conditionOne"
                placeholder="筛选条件一"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="listQuery.conditionOne" :span="8">
            <el-form-item width="300px">
              <el-input
                v-model="listQuery.conditionTwo"
                placeholder="筛选条件二"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="listQuery.conditionTwo" :span="8">
            <el-form-item width="300px">
              <el-input
                v-model="listQuery.conditionThree"
                placeholder="筛选条件三"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
      <el-table-column label="时间" width="180px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.tsMill | parseTime("{y}-{m}-{d} {h}:{i}:{s}.{l}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" width="90px" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="levelObj(row.level).type">{{
            levelObj(row.level).value
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="短消息" width="200px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.short }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详情" width="700px" align="center">
        <template slot-scope="{ row }">
          <el-link type="primary" @click="fullClick(row.full)">{{
            row.full
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="条件一" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.conditionOne }}</span>
        </template>
      </el-table-column>
      <el-table-column label="条件二" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.conditionTwo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="条件三" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.conditionThree }}</span>
        </template>
      </el-table-column>
      <el-table-column label="IP" width="125px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column label="TraceID" width="220px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.traceId }}</span>
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
    <el-dialog title="详情" :visible.sync="dialogVisible">
      <template>
        <div style="text-align: left">
          <JSONPretty
            :data="fullText"
            :show-line="true"
            :show-double-quotes="true"
            :highlight-mouseover-node="true"
            :deep="5"
          />
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchModuleList,
  fetchLoggingList,
  fetchLoggingByTraceID,
} from "@/api/qelog";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import JSONPretty from "vue-json-pretty";
import { startTimeSelect, endTimeSelect } from "@/utils/select.js";

export default {
  name: "Logging",
  components: { Pagination, JSONPretty },
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
        short: undefined,
        level: undefined,
        ip: undefined,
        conditionOne: undefined,
        conditionTwo: undefined,
        conditionThree: undefined,
        forceCollectionName: undefined,
        forceDatabase: undefined,
      },
      traceId: "",
      beginTime: undefined,
      endTime: undefined,
      startTimeSelect: startTimeSelect,
      endTimeSelect: endTimeSelect,

      levelSorts: [
        { index: -1, value: "DEBUG", type: "info" },
        { index: 0, value: "INFO", type: "info" },
        { index: 1, value: "WARN", type: "warning" },
        { index: 2, value: "ERROR", type: "danger" },
        { index: 3, value: "DPANIC", type: "danger" },
        { index: 4, value: "PANIC", type: "danger" },
        { index: 5, value: "FATAL", type: "danger" },
      ],
      fullText: {},
      modules: [],
      modulesMap: {},
      dialogVisible: false,

      rules: {
        moduleName: [
          { required: true, message: "模块名称必填", trigger: "change" },
        ],
      },
    };
  },
  created() {
    this.getModuleList(undefined);
    // this.getList();
  },
  methods: {
    getModuleList(name) {
      fetchModuleList({
        name: name,
        page: 1,
        limit: 50,
      }).then((response) => {
        this.listLoading = false;
        const { list } = response.data;
        const modules = [];
        const modulesMap = {};
        list.forEach((item) => {
          const val = {
            id: item.id,
            moduleName: item.name,
          };
          modulesMap[item.name] = val;
          modules.push(val);
        });
        this.modules = modules;
        this.modulesMap = modulesMap;
      });
    },
    getList() {
      this.listLoading = true;
      const {
        page,
        limit,
        moduleName,
        short,
        level = -2,
        ip,
        conditionOne,
        conditionTwo,
        conditionThree,
        forceCollectionName,
        forceDatabase,
      } = this.listQuery;
      const data = {
        page: page,
        limit: limit,
        moduleName: moduleName,
        short: short,
        level: level === "" ? -2 : level,
        ip: ip,
        conditionOne: conditionOne,
        conditionTwo: conditionTwo,
        conditionThree: conditionThree,
        forceCollectionName: forceCollectionName,
        forceDatabase: forceDatabase,
        beginTsSec: 0,
        endTsSec: 0,
      };

      if (this.beginTime) {
        data.beginTsSec = Math.ceil(this.beginTime.getTime() / 1e3);
      }
      if (this.endTime) {
        data.endTsSec = Math.ceil(this.endTime.getTime() / 1e3);
      }
      fetchLoggingList(data).then((response) => {
        this.list = response.data.list;
        this.total = response.data.count;
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleTraceID() {
      this.listLoading = true;
      const { moduleName, forceDatabase, forceCollectionName } = this.listQuery;
      const data = {
        moduleName: moduleName,
        forceDatabase: forceDatabase,
        forceCollectionName: forceCollectionName,
        traceId: this.traceId,
      };
      fetchLoggingByTraceID(data).then((response) => {
        this.list = response.data.list;
        this.total = response.data.count;
        this.listLoading = false;
      });
    },
    resetListQuery() {
      this.module = {
        name: "",
        desc: "",
      };
    },
    levelObj(level) {
      for (let i = 0; i < this.levelSorts.length; i++) {
        if (this.levelSorts[i].index === level) {
          return this.levelSorts[i];
        }
      }
    },
    fullClick(txt) {
      if (!txt || txt === "") {
        return;
      }
      this.fullText = JSON.parse(txt);
      this.dialogVisible = true;
    },
    resetListQueryFilter() {
      this.listQuery.short = "";
      this.listQuery.ip = "";
      this.listQuery.conditionOne = "";
      this.listQuery.conditionTwo = "";
      this.listQuery.conditionThree = "";
    },
  },
};
</script>
