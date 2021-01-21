<template>
  <div :style="{ height: height, width: width }">
    <span v-if="noData">未获取到数据</span>
    <div
      :id="id"
      :class="className"
      :style="{ height: height, width: width }"
    />
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'
import { calcNum, calcSize } from '@/utils/calc'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    },
    showData: {
      type: Object,
      default: () => {
        return undefined
      }
    }
  },
  data() {
    return {
      chart: null,
      noData: true,
      title: '未获取到数据'
    }
  },
  watch: {
    showData: function(val) {
      this.showData = val
      const cn = calcNum(this.showData.number)
      const cs = calcSize(this.showData.size)
      this.title = `总条数: ${cn.number.toFixed(3)} ${
        cn.unit
      }  总大小: ${cs.number.toFixed(3)} ${cs.unit}`
      this.destoryChart()
      this.initChart()
    }
  },
  mounted() {
    console.log('showData', this.showData)
    if (!this.showData) {
      return
    } else {
      this.noData = false
      const cn = calcNum(this.showData.number)
      const cs = calcSize(this.showData.size)
      this.title = `总条数: ${cn.number.toFixed(3)} ${
        cn.unit
      }  总大小: ${cs.number.toFixed(3)} ${cs.unit}`
    }
    this.destoryChart()
    // set title
    this.initChart()
  },
  beforeDestroy() {
    this.destoryChart()
  },
  methods: {
    destoryChart() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    formatSeries() {
      const series = []
      this.showData.levelSeries.forEach((item, index) => {
        series.push({
          name: item.name,
          type: item.type,
          stack: 'total',
          barMaxWidth: 35,
          barGap: '10%',
          itemStyle: {
            normal: {
              color: item.color,
              barBorderRadius: 0,
              label: {
                show: true,
                textStyle: {
                  color: '#fff'
                },
                position: 'insideTop',
                formatter(p) {
                  return p.value > 0 ? p.value : ''
                }
              }
            }
          },
          data: item.data
        })
      })
      this.showData.ipSeries.forEach((item) => {
        series.push({
          name: item.name,
          type: item.type,
          stack: 'total',
          symbolSize: 10,
          symbol: 'circle',
          itemStyle: {
            normal: {
              color: item.color,
              barBorderRadius: 0,
              label: {
                show: true,
                position: 'top',
                formatter(p) {
                  return p.value > 0 ? p.value : ''
                }
              }
            }
          },
          data: item.data
        })
      })
      console.log(series)
      return series
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      const xData = this.showData.xData
      const start = (function() {
        const length = xData.length
        if (length > 6) {
          const v = (length / 6) * 5
          return v >= 90 ? 90 : v
        }
      })()
      const series = this.formatSeries()
      this.chart.setOption({
        backgroundColor: '#344b58',
        title: {
          text: this.title,
          x: '20',
          top: '20',
          textStyle: {
            color: '#fff',
            fontSize: '22'
          },
          subtextStyle: {
            color: '#90979c',
            fontSize: '16'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            textStyle: {
              color: '#fff'
            }
          }
        },
        grid: {
          left: '5%',
          right: '5%',
          borderWidth: 0,
          top: 120,
          bottom: 95,
          textStyle: {
            color: '#fff'
          }
        },
        legend: {
          x: '5%',
          top: '10%',
          textStyle: {
            color: '#90979c'
          },
          data: this.showData.legendData
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            axisLine: {
              lineStyle: {
                color: '#90979c'
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitArea: {
              show: false
            },
            axisLabel: {
              interval: 0
            },
            data: xData
          }
        ],
        yAxis: [
          {
            type: 'value',
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#90979c'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              interval: 0
            },
            splitArea: {
              show: false
            }
          }
        ],
        dataZoom: [
          {
            show: true,
            height: 30,
            xAxisIndex: [0],
            bottom: 30,
            start: start,
            end: 100,
            handleIcon:
              'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
            handleSize: '100%',
            handleStyle: {
              color: '#d3dee5'
            },
            textStyle: {
              color: '#fff'
            },
            borderColor: '#90979c'
          },
          {
            type: 'inside',
            show: true,
            height: 15,
            start: 1,
            end: 35
          }
        ],
        series: series
      })
    }
  }
}
</script>
