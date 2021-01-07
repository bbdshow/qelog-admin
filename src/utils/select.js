const startTimeSelect = {
  shortcuts: [{
    text: '当前时间',
    onClick(picker) {
      const start = new Date()
      picker.$emit('pick', start)
    }
  }, {
    text: '最近1小时',
    onClick(picker) {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 1)
      picker.$emit('pick', start)
    }
  }, {
    text: '最近3小时',
    onClick(picker) {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 3)
      picker.$emit('pick', start)
    }
  }, {
    text: '最近1天',
    onClick(picker) {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      picker.$emit('pick', start)
    }
  }, {
    text: '最近3天',
    onClick(picker) {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 72)
      picker.$emit('pick', start)
    }
  }, {
    text: '最近7天',
    onClick(picker) {
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      picker.$emit('pick', start)
    }
  }]
}

const endTimeSelect = {
  shortcuts: [{
    text: '当前时间',
    onClick(picker) {
      const end = new Date()
      picker.$emit('pick', end)
    }
  }, {
    text: '未来1小时',
    onClick(picker) {
      const end = new Date()
      end.setTime(end.getTime() + 3600 * 1000 * 1)
      picker.$emit('pick', end)
    }
  }, {
    text: '前1小时',
    onClick(picker) {
      const end = new Date()
      end.setTime(end.getTime() - 3600 * 1000 * 1)
      picker.$emit('pick', end)
    }
  }, {
    text: '前6小时',
    onClick(picker) {
      const end = new Date()
      end.setTime(end.getTime() - 3600 * 1000 * 6)
      picker.$emit('pick', end)
    }
  }, {
    text: '前1天',
    onClick(picker) {
      const end = new Date()
      end.setTime(end.getTime() - 3600 * 1000 * 24)
      picker.$emit('pick', end)
    }
  }]
}

export {
  startTimeSelect,
  endTimeSelect
}
