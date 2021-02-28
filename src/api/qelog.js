import request from '@/utils/request'

export function fetchShardingIndex(query) {
  return request({
    url: '/shardingIndex',
    method: 'get'
  })
}

export function fetchModuleList(query) {
  return request({
    url: '/module/list',
    method: 'get',
    params: query
  })
}

export function createModule(data) {
  return request({
    url: '/module',
    method: 'post',
    data
  })
}

export function updateModule(data) {
  return request({
    url: '/module',
    method: 'put',
    data
  })
}

export function deleteModule(data) {
  return request({
    url: '/module',
    method: 'delete',
    data
  })
}

// =========== Alarm
export function fetchAlarmRuleList(query) {
  return request({
    url: '/alarmRule/list',
    method: 'get',
    params: query
  })
}

export function createAlarmRule(data) {
  return request({
    url: '/alarmRule',
    method: 'post',
    data
  })
}

export function updateAlarmRule(data) {
  return request({
    url: '/alarmRule',
    method: 'put',
    data
  })
}

export function deleteAlarmRule(data) {
  return request({
    url: '/alarmRule',
    method: 'delete',
    data
  })
}
export function fetchHookURLList(query) {
  return request({
    url: '/alarmRule/hook/list',
    method: 'get',
    params: query
  })
}

export function createHookURL(data) {
  return request({
    url: '/alarmRule/hook',
    method: 'post',
    data
  })
}

export function updateHookURL(data) {
  return request({
    url: '/alarmRule/hook',
    method: 'put',
    data
  })
}

export function deleteHookURL(data) {
  return request({
    url: '/alarmRule/hook',
    method: 'delete',
    data
  })
}
export function pingHookURL(query) {
  return request({
    url: '/alarmRule/hook/ping',
    method: 'get',
    params: query
  })
}

// ======== 日志查询
export function fetchLoggingList(data) {
  return request({
    url: '/logging/list',
    method: 'post',
    data
  })
}

export function fetchLoggingByTraceID(data) {
  return request({
    url: '/logging/traceid',
    method: 'post',
    data
  })
}

export function deleteLoggingCollection(data) {
  return request({
    url: '/logging/collection',
    method: 'delete',
    data
  })
}

// ==== 统计

export function fetchMetricsDBStats() {
  return request({
    url: '/metrics/dbStats',
    method: 'get'
  })
}

export function fetchMetricsCollStats(query) {
  return request({
    url: '/metrics/collStats',
    method: 'get',
    params: query
  })
}

export function fetchMetricsModuleList(query) {
  return request({
    url: '/metrics/module/list',
    method: 'get',
    params: query
  })
}

export function fetchMetricsModuleTrend(query) {
  return request({
    url: '/metrics/module/trend',
    method: 'get',
    params: query
  })
}
