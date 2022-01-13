import axios from 'axios'
import router from '@/router'
import {
  MessageBox,
  Message
} from 'element-ui'
import store from '@/store'
import {
  getToken,
  removeToken
} from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 120000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)
const authInvalidCodes = [10,11,12,13]
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 0) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 10 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (authInvalidCodes.indexOf(res.code) !== -1) {
        // to re-login
        MessageBox.confirm(`${res.message} 您即将退出，可选择重新登录`, '确认退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log(error.response) // for debug
    if (error && error.response.status == 401) {
      // auth invalid
         // to re-login
         MessageBox.confirm(`${error.response.data.message} 您即将退出，可选择重新登录`, '确认退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            router.push({path:'/login'})
          })
        })

      // Message({
      //   message: error.response.data.message || 'auth invalid',
      //   type: 'error',
      //   duration: 3 * 1000
      // })
      // removeToken()
      // router.push({path:'/login'})
    }else {
      Message({
        message: error.message,
        type: 'error',
        duration: 10 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
