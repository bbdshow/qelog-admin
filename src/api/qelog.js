import request from '@/utils/request'

export function fetchDBIndex(query) {
  return request({
    url: '/db-index',
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
    url: '/alarm-rule/list',
    method: 'get',
    params: query
  })
}

export function createAlarmRule(data) {
  return request({
    url: '/alarm-rule',
    method: 'post',
    data
  })
}

export function updateAlarmRule(data) {
  return request({
    url: '/alarm-rule',
    method: 'put',
    data
  })
}

export function deleteAlarmRule(data) {
  return request({
    url: '/alarm-rule',
    method: 'delete',
    data
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

export function fetchMetricsCount() {
  return request({
    url: '/metrics/count',
    method: 'get'
  })
}

export function fetchMetricsModuleList(query) {
  return request({
    url: '/metrics/module/list',
    method: 'get',
    params: query
  })
}