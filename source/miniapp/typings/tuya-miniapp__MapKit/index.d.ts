/**
 * MapKit
 *
 * @version 7.8.3
 */
declare namespace ty.map {
  /**
   * 是否开启地理围栏功能，与 NG 配置是否开启有关
   * @public
   * @since MapKit 3.9.1
   * @platform iOS Android
   */
  export function isSupport(params?: {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessType?: string
    /**
     * 该业务类型的附加数据
     * @since MapKit 3.9.1
     */
    businessData?: Record<string, any>
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 是否支持地理围栏
       * @since MapKit 3.9.1
       * @defaultValue false
       */
      isSupport?: boolean
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 地理围栏是否达到上限，不同手机系统限制数量不一样
   * @public
   * @since MapKit 3.9.1
   * @platform iOS Android
   */
  export function isReachLimit(params?: {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessType?: string
    /**
     * 该业务类型的附加数据
     * @since MapKit 3.9.1
     */
    businessData?: Record<string, any>
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 地理围栏是否达到上限
       * @since MapKit 3.9.1
       * @defaultValue false
       */
      reachLimit?: boolean
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 打开地理围栏地图页面,获取地理围栏信息(新建或者编辑地理围栏)
   * 权限: [scope.userLocationBackground] 没有权限时本方法会引导申请权限
   * @public
   * @since MapKit 3.9.1
   * @platform iOS Android
   */
  export function openMap(params: {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessInfo?: GeofenceBusinessInfo
    /**
     * 地理围栏信息
     * @since MapKit 3.9.1
     */
    info: GeofenceInfo
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 取消保存地理围栏
       * @since MapKit 3.9.1
       * @defaultValue false
       */
      isCancel?: boolean
      /**
       * 地理围栏信息
       * @since MapKit 3.9.1
       */
      geofenceInfo: GeofenceInfo
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 注册地理围栏。当编辑地理围栏时，需要先 unregister 旧的地理围栏，再 register 新的地理围栏
   * @public
   * @since MapKit 3.9.1
   * @platform iOS Android
   */
  export function register(params: {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessInfo?: GeofenceBusinessInfo
    /**
     * 地理围栏信息
     * @since MapKit 3.9.1
     */
    info: GeofenceInfo
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 取消地理围栏
   * @public
   * @since MapKit 3.9.1
   * @platform iOS Android
   */
  export function unregister(params: {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessInfo?: GeofenceBusinessInfo
    /**
     * 地理围栏信息
     * @since MapKit 3.9.1
     */
    info: GeofenceInfo
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 更新地理围栏状态
   * @public
   * @since MapKit 3.9.8
   * @platform iOS Android
   */
  export function changeGeofenceStatus(params: {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.8
     */
    businessInfo?: GeofenceBusinessInfo
    /**
     * 地理围栏信息
     * @since MapKit 3.9.8
     */
    info: GeofenceInfo
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 取消地理围栏
   * 权限: [scope.location]
   * @public
   * @since MapKit 3.0.1
   * @platform iOS Android
   * @deprecated unregister
   */
  export function unregisterGeofence(params?: {
    /**
     * 地理围栏名称
     * @since MapKit 3.9.1
     */
    geoTitle?: string
    /**
     * 经度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    longitude?: number
    /**
     * 纬度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    latitude?: number
    /**
     * 半径
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    radius?: number
    /**
     * id
     * @since MapKit 3.9.1
     */
    geofenceId?: string
    /**
     * 半径
     * 0:进度地理围栏
     * 1：离开地理围栏
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    type?: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 地理围栏是否达到上限
   * 权限: [scope.location]
   * @public
   * @since MapKit 3.0.1
   * @platform iOS Android
   * @deprecated isReachLimit
   */
  export function isGeofenceReachLimit(params?: {
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 地理围栏是否达到上限
       * @since MapKit 3.0.5
       * @defaultValue false
       */
      reachLimit?: boolean
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 更新地理围栏
   * 权限: [scope.location]
   * @public
   * @since MapKit 3.0.1
   * @platform iOS Android
   * @deprecated register
   */
  export function updateGeofence(params: {
    /**
     * 注册的地理围栏
     * @since MapKit 3.0.1
     */
    registerGeoFence: GeofenceInfo[]
    /**
     * 取消的地理围栏
     * @since MapKit 3.0.1
     */
    unregisterGeoFence: GeofenceInfo[]
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 更新成功
       * @since MapKit 3.0.5
       * @defaultValue false
       */
      success?: boolean
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 注册地理围栏
   * 权限: [scope.location]
   * @public
   * @since MapKit 3.0.1
   * @platform iOS Android
   * @deprecated register
   */
  export function registerGeofence(params?: {
    /**
     * 地理围栏名称
     * @since MapKit 3.9.1
     */
    geoTitle?: string
    /**
     * 经度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    longitude?: number
    /**
     * 纬度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    latitude?: number
    /**
     * 半径
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    radius?: number
    /**
     * id
     * @since MapKit 3.9.1
     */
    geofenceId?: string
    /**
     * 半径
     * 0:进度地理围栏
     * 1：离开地理围栏
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    type?: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 打开地理围栏地图页面,获取地理围栏信息(新建或者编辑地理围栏)
   * 权限: [scope.location]
   * @public
   * @since MapKit 3.0.1
   * @platform iOS Android
   * @deprecated openMap
   */
  export function openGeofenceMap(params?: {
    /**
     * 地理围栏名称
     * @since MapKit 3.9.1
     */
    geoTitle?: string
    /**
     * 经度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    longitude?: number
    /**
     * 纬度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    latitude?: number
    /**
     * 半径
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    radius?: number
    /**
     * id
     * @since MapKit 3.9.1
     */
    geofenceId?: string
    /**
     * 半径
     * 0:进度地理围栏
     * 1：离开地理围栏
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    type?: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 获取当前地理位置和速度
   * @public
   * @since MapKit 1.0.6
   * @platform iOS Android
   */
  export function getLocation(params: {
    /**
     * wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标
     * @since MapKit 1.0.6
     */
    type: string
    /**
     * 传入true会返回高度信息。由于获取高度需要较高精度，会减慢接口响应速度。
     * @since MapKit 1.0.6
     */
    altitude: boolean
    /**
     * 开启高精度定位
     * @since MapKit 1.0.6
     */
    isHighAccuracy: boolean
    /**
     * 高精度定位超时时间(ms)。指定时间内返回最高精度，该值3000ms以上高精度定位才有效果。
     * @since MapKit 1.0.6
     */
    highAccuracyExpireTime: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 纬度，范围 -90~90，负数表示南纬
       * @since MapKit 3.0.5
       */
      latitude: number
      /**
       * 经度，范围 -180~180，负数表示西经
       * @since MapKit 3.0.5
       */
      longitude: number
      /**
       * 速度，单位 m/s
       * @since MapKit 3.0.5
       */
      speed: number
      /**
       * 定位精度
       * @since MapKit 3.0.5
       */
      accuracy: number
      /**
       * 海拔，单位 m
       * @since MapKit 3.0.5
       */
      altitude: number
      /**
       * 垂直精度，单位 m（Android无法获取，返回0）
       * @since MapKit 3.0.5
       */
      verticalAccuracy: number
      /**
       * 水平精度，单位 m
       * @since MapKit 3.0.5
       */
      horizontalAccuracy: number
      /**
       * 城市名称
       * @since MapKit 3.0.5
       */
      cityName: string
      /**
       * 街道名称
       * @since MapKit 3.0.5
       */
      streetName: string
      /**
       * 位置名称，历史上iOS返回Array类型，建议使用formatAddress字段
       * @since MapKit 3.0.5
       */
      address: string
      /**
       * 格式化地址
       * @since MapKit 3.6.0
       */
      formatAddress: string
      /**
       * 国家代码
       * @since MapKit 3.1.0
       */
      countryCode: string
      /**
       * 邮政编码
       * @since MapKit 3.1.0
       */
      postalCode: string
      /**
       * 国家名称
       * @since MapKit 3.1.1
       */
      countryName: string
      /**
       * 省份名称
       * @since MapKit 3.1.1
       */
      province: string
      /**
       * 区县名称，二级区域名称
       * @since MapKit 3.1.1
       */
      district: string
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 打开地图选择位置
   * @public
   * @since MapKit 1.0.6
   * @platform iOS Android
   */
  export function chooseLocation(params?: {
    /**
     * 目标纬度
     * @since MapKit 1.0.6
     */
    latitude?: number
    /**
     * 目标经度
     * @since MapKit 1.0.6
     */
    longitude?: number
    /**
     * 标题
     * @since MapKit 7.4.0
     */
    title?: string
    /**
     * 详细描述文本
     * @since MapKit 7.4.0
     */
    detailText?: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 位置名称
       * @since MapKit 3.0.5
       */
      name: string
      /**
       * 详细地址
       * @since MapKit 3.0.5
       */
      address: string
      /**
       * 纬度，浮点数，范围 -90~90，负数表示南纬。使用gcj02坐标系。
       * @since MapKit 3.0.5
       */
      latitude: number
      /**
       * 经度，浮点数，范围 -180~180，负数表示西经。使用gcj02坐标系。
       * @since MapKit 3.0.5
       */
      longitude: number
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 获取可打开的第三方地图类型
   * @public
   * @since MapKit 2.1.0
   * @platform iOS Android
   */
  export function getMapList(params?: {
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 支持的地图厂商，目前支持：BMK: 百度地图, MA: 高德地图, TENCENT: 腾讯地图, Google: 谷歌地图
       * @since MapKit 3.0.5
       */
      maps: string[]
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 使用第三方地图查看位置
   * @public
   * @since MapKit 2.1.0
   * @platform iOS Android
   */
  export function openMapAppLocation(params: {
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 2.1.0
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 2.1.0
     */
    longitude: number
    /**
     * 位置名称
     * @since MapKit 2.1.0
     */
    name: string
    /**
     * 地址详细描述
     * @since MapKit 2.1.0
     */
    address: string
    /**
     * 地图类型，目前支持：BMK: 百度地图, MA: 高德地图, TENCENT: 腾讯地图, Google: 谷歌地图
     * @since MapKit 2.1.0
     */
    mapType: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 使用第三方地图应用打开地图并导航到指定位置
   * @public
   * @since MapKit 7.4.0
   * @platform iOS Android
   */
  export function openMapNavigation(params: {
    /**
     * 起始位置
     * @since MapKit 7.4.0
     */
    startLocation: LocationInfo
    /**
     * 终点位置
     * @since MapKit 7.4.0
     */
    endLocation: LocationInfo
    /**
     * 导航模式
     * @since MapKit 7.5.8
     */
    navigationMode: string
    /**
     * 地图类型，目前支持：BMK: 百度地图, MA: 高德地图, TENCENT: 腾讯地图, Google: 谷歌地图
     * @since MapKit 7.4.0
     */
    mapType: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: () => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 转换经纬度或地址
   * @public
   * @since MapKit 3.2.2
   * @platform iOS Android
   */
  export function transformLocation(params: {
    /**
     * wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标
     * @since MapKit 3.2.2
     */
    type: string
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 3.2.2
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 3.2.2
     */
    longitude: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 纬度，范围 -90~90，负数表示南纬
       * @since MapKit 3.2.2
       */
      latitude: number
      /**
       * 经度，范围 -180~180，负数表示西经
       * @since MapKit 3.2.2
       */
      longitude: number
      /**
       * 城市名称
       * @since MapKit 3.2.2
       */
      cityName: string
      /**
       * 街道名称
       * @since MapKit 3.2.2
       */
      streetName: string
      /**
       * 位置名称，历史上iOS返回Array类型，建议使用formatAddress字段
       * @since MapKit 3.2.2
       */
      address: string
      /**
       * 格式化地址
       * @since MapKit 3.6.0
       */
      formatAddress: string
      /**
       * 国家代码
       * @since MapKit 3.2.2
       */
      countryCode: string
      /**
       * 邮政编码
       * @since MapKit 3.2.2
       */
      postalCode: string
      /**
       * 国家名称
       * @since MapKit 3.2.2
       */
      countryName: string
      /**
       * 省份名称
       * @since MapKit 3.2.2
       */
      province: string
      /**
       * 区县名称，二级区域名称
       * @since MapKit 3.2.2
       */
      district: string
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 将经纬度转换为具体地址
   * @public
   * @since MapKit 3.4.13
   * @platform iOS Android
   */
  export function reverseGeocodeLocation(params: {
    /**
     * 经度
     * @since MapKit 3.4.13
     */
    longitude: number
    /**
     * 纬度
     * @since MapKit 3.4.13
     */
    latitude: number
    /**
     * 请求坐标类型，wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标，默认为wgs84
     * @since MapKit 3.4.13
     * @defaultValue "wgs84"
     */
    requestType?: string
    /**
     * 响应坐标类型，wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标，默认为wgs84
     * @since MapKit 3.4.13
     * @defaultValue "wgs84"
     */
    responseType?: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 纬度，范围 -90~90，负数表示南纬
       * @since MapKit 3.4.13
       */
      latitude: number
      /**
       * 经度，范围 -180~180，负数表示西经
       * @since MapKit 3.4.13
       */
      longitude: number
      /**
       * 城市名称
       * @since MapKit 3.4.13
       */
      cityName: string
      /**
       * 街道名称
       * @since MapKit 3.4.13
       */
      streetName: string
      /**
       * 位置名称，历史上iOS返回Array类型，建议使用formatAddress字段
       * @since MapKit 3.4.13
       */
      address: string
      /**
       * 格式化地址
       * @since MapKit 3.6.0
       */
      formatAddress: string
      /**
       * 国家代码
       * @since MapKit 3.4.13
       */
      countryCode: string
      /**
       * 邮政编码
       * @since MapKit 3.4.13
       */
      postalCode: string
      /**
       * 国家名称
       * @since MapKit 3.4.13
       */
      countryName: string
      /**
       * 省份名称
       * @since MapKit 3.4.13
       */
      province: string
      /**
       * 区县名称，二级区域名称
       * @since MapKit 3.4.13
       */
      district: string
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 将WGS84坐标系转换为GCJ02坐标系
   * @public
   * @since MapKit 3.4.13
   * @platform iOS Android
   */
  export function coordinateWGS84ToGCJ02(params: {
    /**
     * 经度
     * @since MapKit 3.4.13
     */
    longitude: number
    /**
     * 纬度
     * @since MapKit 3.4.13
     */
    latitude: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 经度
       * @since MapKit 3.4.13
       */
      longitude: number
      /**
       * 纬度
       * @since MapKit 3.4.13
       */
      latitude: number
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 将GCJ02坐标系转换为WGS84坐标系
   * @public
   * @since MapKit 3.4.13
   * @platform iOS Android
   */
  export function coordinateGCJ02ToWGS84(params: {
    /**
     * 经度
     * @since MapKit 3.4.13
     */
    longitude: number
    /**
     * 纬度
     * @since MapKit 3.4.13
     */
    latitude: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 经度
       * @since MapKit 3.4.13
       */
      longitude: number
      /**
       * 纬度
       * @since MapKit 3.4.13
       */
      latitude: number
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 获取当前地图类型
   * huawei: 华为地图
   * google: 谷歌地图
   * amap: 高德地图
   * apple: 苹果地图
   * @public
   * @since MapKit 3.4.13
   * @platform iOS Android
   */
  export function getMapType(params?: {
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 地图类型
       * @since MapKit 3.4.13
       */
      type: string
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 搜索地址(列表)
   * @public
   * @since MapKit 3.4.16
   * @platform iOS Android
   */
  export function searchAddressList(params: {
    /**
     * 地图能力(Android only)
     * 0-高德
     * 1-Google
     * 2-mapbox
     * @since MapKit 3.4.16
     */
    type: number
    /**
     * 模糊搜索关键词 The search string that you want completions for.
     * @since MapKit 3.4.16
     */
    keyword: string
    /**
     * 当前城市名字-仅高德搜索需要
     * 传入""代表在全国进行检索，否则按照传入的city进行范围检索
     * @since MapKit 3.4.16
     * @defaultValue ""
     */
    city?: string
    /**
     * 限制搜索范围的国家代码-仅Google、MapBox地址搜索需要
     * ISO 3166-1 Alpha-2 国家/地区代码(不区分大小写)
     * 例如:中国CN、香港HK、台湾TW
     * @since MapKit 3.4.16
     */
    countryCode: string
    /**
     * 搜索中心点经纬度、搜索范围(IOS ONLY)设置
     * @since MapKit 3.4.16
     */
    region: CoordinateRegion
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: AddressInfo[]) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /**
   * 获取地址详细信息
   * @public
   * @since MapKit 3.4.16
   * @platform iOS Android
   */
  export function getAddressInfo(params: {
    /**
     * 地址 POI ID
     * @since MapKit 3.4.16
     */
    poiID: string
    /**
     * 地址名称
     * @since MapKit 3.4.16
     */
    name: string
    /**
     * 详细的地址信息
     * @since MapKit 3.4.16
     */
    address: string
    /**
     * 当前地址经纬度坐标
     * @since MapKit 3.4.16
     */
    coordinate2D: LocationCoordinate2D
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * 地址 POI ID
       * @since MapKit 3.4.16
       */
      poiID: string
      /**
       * 地址名称
       * @since MapKit 3.4.16
       */
      name: string
      /**
       * 详细的地址信息
       * @since MapKit 3.4.16
       */
      address: string
      /**
       * 当前地址经纬度坐标
       * @since MapKit 3.4.16
       */
      coordinate2D: LocationCoordinate2D
    }) => void
    /** 接口调用失败的回调函数 */
    fail?: (params: {
      /** 错误信息 */
      errorMsg: string
      /** 错误码 */
      errorCode: string | number
      /** 错误扩展 */
      innerError: {
        /** 错误扩展码 */
        errorCode: string | number
        /** 错误扩展信息 */
        errorMsg: string
      }
    }) => void
  }): void

  /** @since MapKit 2.2.1 */
  export interface DiffLayerMap {
    /**
     * 当前组件类型
     * @since MapKit 2.2.1
     * @defaultValue 0
     */
    type?: number
  }

  /** @since MapKit 3.9.1 */
  export interface GeofenceBusinessInfo {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessType?: string
    /**
     * 该业务类型的附加数据
     * @since MapKit 3.9.1
     */
    businessData?: Record<string, any>
  }

  /** @since MapKit 3.9.1 */
  export interface IsGeofenceSupportResponse {
    /**
     * 是否支持地理围栏
     * @since MapKit 3.9.1
     * @defaultValue false
     */
    isSupport?: boolean
  }

  /** @since MapKit 3.0.1 */
  export interface IsGeofenceReachLimitResponse {
    /**
     * 地理围栏是否达到上限
     * @since MapKit 3.0.1
     * @defaultValue false
     */
    reachLimit?: boolean
  }

  /** @since MapKit 3.0.1 */
  export interface GeofenceInfo {
    /**
     * 地理围栏名称
     * @since MapKit 3.9.1
     */
    geoTitle?: string
    /**
     * 经度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    longitude?: number
    /**
     * 纬度
     * @since MapKit 3.9.1
     * @defaultValue 0.0
     */
    latitude?: number
    /**
     * 半径
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    radius?: number
    /**
     * id
     * @since MapKit 3.9.1
     */
    geofenceId?: string
    /**
     * 半径
     * 0:进度地理围栏
     * 1：离开地理围栏
     * @since MapKit 3.9.1
     * @defaultValue 0
     */
    type?: number
  }

  /** @since MapKit 3.9.1 */
  export interface Geofence {
    /**
     * 区分不同的地理围栏业务。空数据时默认为场景类型地理围栏 GeofenceBusinessType.Scene。
     * @since MapKit 3.9.1
     */
    businessInfo?: GeofenceBusinessInfo
    /**
     * 地理围栏信息
     * @since MapKit 3.9.1
     */
    info: GeofenceInfo
  }

  /** @since MapKit 3.9.1 */
  export interface OpenMapResponse {
    /**
     * 取消保存地理围栏
     * @since MapKit 3.9.1
     * @defaultValue false
     */
    isCancel?: boolean
    /**
     * 地理围栏信息
     * @since MapKit 3.9.1
     */
    geofenceInfo: GeofenceInfo
  }

  /** @since MapKit 3.0.1 */
  export interface UpdateGeofenceParams {
    /**
     * 注册的地理围栏
     * @since MapKit 3.0.1
     */
    registerGeoFence: GeofenceInfo[]
    /**
     * 取消的地理围栏
     * @since MapKit 3.0.1
     */
    unregisterGeoFence: GeofenceInfo[]
  }

  /** @since MapKit 3.0.1 */
  export interface UpdateGeofenceResponse {
    /**
     * 更新成功
     * @since MapKit 3.0.1
     * @defaultValue false
     */
    success?: boolean
  }

  /** @since MapKit 3.0.1 */
  export interface SupportGeofenceResponse {
    /**
     * 是否支持地理围栏
     * @since MapKit 3.0.1
     * @defaultValue false
     */
    isSupport?: boolean
  }

  /** @since MapKit 3.9.8 */
  export enum GeofenceBusinessType {
    /**
     * 场景类型地理围栏
     * @since MapKit 3.9.8
     */
    Scene = "scene",

    /**
     * 门锁场景地理围栏
     * @since MapKit 3.9.8
     */
    BleLockScene = "bleLockScene",
  }

  /** @since MapKit 1.0.6 */
  export interface LocationBean {
    /**
     * wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标
     * @since MapKit 1.0.6
     */
    type: string
    /**
     * 传入true会返回高度信息。由于获取高度需要较高精度，会减慢接口响应速度。
     * @since MapKit 1.0.6
     */
    altitude: boolean
    /**
     * 开启高精度定位
     * @since MapKit 1.0.6
     */
    isHighAccuracy: boolean
    /**
     * 高精度定位超时时间(ms)。指定时间内返回最高精度，该值3000ms以上高精度定位才有效果。
     * @since MapKit 1.0.6
     */
    highAccuracyExpireTime: number
  }

  /** @since MapKit 1.0.6 */
  export interface LocationCB {
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 1.0.6
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 1.0.6
     */
    longitude: number
    /**
     * 速度，单位 m/s
     * @since MapKit 1.0.6
     */
    speed: number
    /**
     * 定位精度
     * @since MapKit 1.0.6
     */
    accuracy: number
    /**
     * 海拔，单位 m
     * @since MapKit 1.0.6
     */
    altitude: number
    /**
     * 垂直精度，单位 m（Android无法获取，返回0）
     * @since MapKit 1.0.6
     */
    verticalAccuracy: number
    /**
     * 水平精度，单位 m
     * @since MapKit 1.0.6
     */
    horizontalAccuracy: number
    /**
     * 城市名称
     * @since MapKit 3.0.4
     */
    cityName: string
    /**
     * 街道名称
     * @since MapKit 3.0.4
     */
    streetName: string
    /**
     * 位置名称，历史上iOS返回Array类型，建议使用formatAddress字段
     * @since MapKit 3.0.4
     */
    address: string
    /**
     * 格式化地址
     * @since MapKit 3.6.0
     */
    formatAddress: string
    /**
     * 国家代码
     * @since MapKit 3.1.0
     */
    countryCode: string
    /**
     * 邮政编码
     * @since MapKit 3.1.0
     */
    postalCode: string
    /**
     * 国家名称
     * @since MapKit 3.1.1
     */
    countryName: string
    /**
     * 省份名称
     * @since MapKit 3.1.1
     */
    province: string
    /**
     * 区县名称，二级区域名称
     * @since MapKit 3.1.1
     */
    district: string
  }

  /** @since MapKit 1.0.6 */
  export interface ChooseBean {
    /**
     * 目标纬度
     * @since MapKit 1.0.6
     */
    latitude?: number
    /**
     * 目标经度
     * @since MapKit 1.0.6
     */
    longitude?: number
    /**
     * 标题
     * @since MapKit 7.4.0
     */
    title?: string
    /**
     * 详细描述文本
     * @since MapKit 7.4.0
     */
    detailText?: string
  }

  /** @since MapKit 1.0.6 */
  export interface ChooseCB {
    /**
     * 位置名称
     * @since MapKit 1.0.6
     */
    name: string
    /**
     * 详细地址
     * @since MapKit 1.0.6
     */
    address: string
    /**
     * 纬度，浮点数，范围 -90~90，负数表示南纬。使用gcj02坐标系。
     * @since MapKit 1.0.6
     */
    latitude: number
    /**
     * 经度，浮点数，范围 -180~180，负数表示西经。使用gcj02坐标系。
     * @since MapKit 1.0.6
     */
    longitude: number
  }

  /** @since MapKit 2.1.0 */
  export interface MapsBean {
    /**
     * 支持的地图厂商，目前支持：BMK: 百度地图, MA: 高德地图, TENCENT: 腾讯地图, Google: 谷歌地图
     * @since MapKit 2.1.0
     */
    maps: string[]
  }

  /** @since MapKit 2.1.0 */
  export interface OpenMapAppBean {
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 2.1.0
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 2.1.0
     */
    longitude: number
    /**
     * 位置名称
     * @since MapKit 2.1.0
     */
    name: string
    /**
     * 地址详细描述
     * @since MapKit 2.1.0
     */
    address: string
    /**
     * 地图类型，目前支持：BMK: 百度地图, MA: 高德地图, TENCENT: 腾讯地图, Google: 谷歌地图
     * @since MapKit 2.1.0
     */
    mapType: string
  }

  /**
   * 位置信息
   * @since MapKit 7.4.0
   */
  export interface LocationInfo {
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 7.4.0
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 7.4.0
     */
    longitude: number
    /**
     * 当前点位置名称
     * @since MapKit 7.4.0
     */
    addressName: string
  }

  /**
   * 使用第三方地图应用打开地图并导航到指定位置
   * @since MapKit 7.4.0
   */
  export interface OpenMapNavigationBean {
    /**
     * 起始位置
     * @since MapKit 7.4.0
     */
    startLocation: LocationInfo
    /**
     * 终点位置
     * @since MapKit 7.4.0
     */
    endLocation: LocationInfo
    /**
     * 导航模式
     * @since MapKit 7.5.8
     */
    navigationMode: string
    /**
     * 地图类型，目前支持：BMK: 百度地图, MA: 高德地图, TENCENT: 腾讯地图, Google: 谷歌地图
     * @since MapKit 7.4.0
     */
    mapType: string
  }

  /** @since MapKit 3.2.2 */
  export interface TransformLocationReq {
    /**
     * wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标
     * @since MapKit 3.2.2
     */
    type: string
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 3.2.2
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 3.2.2
     */
    longitude: number
  }

  /** @since MapKit 3.2.2 */
  export interface TransformLocationResp {
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 3.2.2
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 3.2.2
     */
    longitude: number
    /**
     * 城市名称
     * @since MapKit 3.2.2
     */
    cityName: string
    /**
     * 街道名称
     * @since MapKit 3.2.2
     */
    streetName: string
    /**
     * 位置名称，历史上iOS返回Array类型，建议使用formatAddress字段
     * @since MapKit 3.2.2
     */
    address: string
    /**
     * 格式化地址
     * @since MapKit 3.6.0
     */
    formatAddress: string
    /**
     * 国家代码
     * @since MapKit 3.2.2
     */
    countryCode: string
    /**
     * 邮政编码
     * @since MapKit 3.2.2
     */
    postalCode: string
    /**
     * 国家名称
     * @since MapKit 3.2.2
     */
    countryName: string
    /**
     * 省份名称
     * @since MapKit 3.2.2
     */
    province: string
    /**
     * 区县名称，二级区域名称
     * @since MapKit 3.2.2
     */
    district: string
  }

  /** @since MapKit 3.4.13 */
  export interface ReverseGeocodeLocationReq {
    /**
     * 经度
     * @since MapKit 3.4.13
     */
    longitude: number
    /**
     * 纬度
     * @since MapKit 3.4.13
     */
    latitude: number
    /**
     * 请求坐标类型，wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标，默认为wgs84
     * @since MapKit 3.4.13
     * @defaultValue "wgs84"
     */
    requestType?: string
    /**
     * 响应坐标类型，wgs84返回GPS坐标，gcj02返回可用于openLocation的坐标，默认为wgs84
     * @since MapKit 3.4.13
     * @defaultValue "wgs84"
     */
    responseType?: string
  }

  /** @since MapKit 3.4.13 */
  export interface Coordinate {
    /**
     * 经度
     * @since MapKit 3.4.13
     */
    longitude: number
    /**
     * 纬度
     * @since MapKit 3.4.13
     */
    latitude: number
  }

  /** @since MapKit 3.4.13 */
  export interface MapTypeBean {
    /**
     * 地图类型
     * @since MapKit 3.4.13
     */
    type: string
  }

  /** @since MapKit 1.0.6 */
  export interface LocationError {
    /**
     * 定位错误码
     * @since MapKit 1.0.6
     */
    errCode: number
  }

  /** @since MapKit 1.0.6 */
  export interface OpenBean {
    /**
     * 纬度，范围 -90~90，负数表示南纬
     * @since MapKit 1.0.6
     */
    latitude: number
    /**
     * 经度，范围 -180~180，负数表示西经
     * @since MapKit 1.0.6
     */
    longitude: number
    /**
     * 缩放级别，范围 5~18
     * @since MapKit 1.0.6
     * @defaultValue 18
     */
    scale?: number
    /**
     * 位置名称
     * @since MapKit 1.0.6
     */
    name?: string
    /**
     * 地址详细描述
     * @since MapKit 1.0.6
     */
    address?: string
  }

  /** @since MapKit 3.4.16 */
  export interface CoordinateRegion {}

  /**
   * 地图搜索-参数配置
   * @since MapKit 3.4.16
   */
  export interface AddressRequestParams {
    /**
     * 地图能力(Android only)
     * 0-高德
     * 1-Google
     * 2-mapbox
     * @since MapKit 3.4.16
     */
    type: number
    /**
     * 模糊搜索关键词 The search string that you want completions for.
     * @since MapKit 3.4.16
     */
    keyword: string
    /**
     * 当前城市名字-仅高德搜索需要
     * 传入""代表在全国进行检索，否则按照传入的city进行范围检索
     * @since MapKit 3.4.16
     * @defaultValue ""
     */
    city?: string
    /**
     * 限制搜索范围的国家代码-仅Google、MapBox地址搜索需要
     * ISO 3166-1 Alpha-2 国家/地区代码(不区分大小写)
     * 例如:中国CN、香港HK、台湾TW
     * @since MapKit 3.4.16
     */
    countryCode: string
    /**
     * 搜索中心点经纬度、搜索范围(IOS ONLY)设置
     * @since MapKit 3.4.16
     */
    region: CoordinateRegion
  }

  /** @since MapKit 3.4.16 */
  export interface LocationCoordinate2D {}

  /**
   * 地址信息
   * @since MapKit 3.4.16
   */
  export interface AddressInfo {
    /**
     * 地址 POI ID
     * @since MapKit 3.4.16
     */
    poiID: string
    /**
     * 地址名称
     * @since MapKit 3.4.16
     */
    name: string
    /**
     * 详细的地址信息
     * @since MapKit 3.4.16
     */
    address: string
    /**
     * 当前地址经纬度坐标
     * @since MapKit 3.4.16
     */
    coordinate2D: LocationCoordinate2D
  }
}
