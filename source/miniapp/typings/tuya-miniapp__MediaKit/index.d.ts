/**
 * MediaKit
 *
 * @version 3.7.0
 */
declare namespace ty.media {
  /**
   * Camera异层渲染组件的相机数据模型
   * @since MediaKit 2.0.1
   */
  export interface DiffLayerCamera {
    /**
     * 当前异层组件对应的视图类型，默认为3（相机类型）
     * @since MediaKit 2.0.1
     * @defaultValue 3
     */
    type?: number
  }

  /**
   * Video异层渲染组件的视频数据模型
   * @since MediaKit 1.0.0
   */
  export interface DiffLayerVideo {
    /**
     * 当前异层组件对应的视图类型，默认为1（视频类型）
     * @since MediaKit 1.0.0
     * @defaultValue 1
     */
    type?: number
  }

  /** @since MediaKit 3.3.1 */
  export interface ManagerContext {
    /**
     * 间隔多长时间接收系统的录音信息(单位：ms)
     * @since MediaKit 3.5.0
     * @defaultValue 0
     */
    interval?: number
    /**
     * 音频管理器实例 ID，由 getRGBAudioManager 创建后返回
     * @since MediaKit 3.3.1
     */
    managerId: number
  }

  /** @since MediaKit 3.3.1 */
  export interface Received {
    /**
     * 音频管理器实例 ID
     * @since MediaKit 3.6.7
     */
    managerId: number
    /**
     * 语音识别转换后的文本内容
     * @since MediaKit 3.3.1
     */
    body: string
  }

  interface GetRGBAudioManagerTask {
    /**
     * 开始识音
     * @public
     * @since MediaKit 3.3.1
     * @platform iOS Android
     */
    startRGBRecord(params: {
      /**
       * 间隔多长时间接收系统的录音信息(单位：ms)
       * @since MediaKit 3.5.0
       * @defaultValue 0
       */
      interval?: number
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
     * 结束识音
     * @public
     * @since MediaKit 3.3.1
     * @platform iOS Android
     */
    stopRGBRecord(params: {
      /**
       * 间隔多长时间接收系统的录音信息(单位：ms)
       * @since MediaKit 3.5.0
       * @defaultValue 0
       */
      interval?: number
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
     * 开始监听
     * @public
     * @since MediaKit 3.3.1
     * @platform iOS Android
     */
    onAudioRgbChange(
      listener: (params: {
        /**
         * 音频管理器实例 ID
         * @since MediaKit 3.6.7
         */
        managerId: number
        /**
         * 语音识别转换后的文本内容
         * @since MediaKit 3.3.1
         */
        body: string
      }) => void
    ): void

    /**
     * 结束监听
     * @public
     * @since MediaKit 3.4.0
     * @platform iOS Android
     */
    offAudioRgbChange(
      listener: (params: {
        /**
         * 音频管理器实例 ID
         * @since MediaKit 3.6.7
         */
        managerId: number
        /**
         * 语音识别转换后的文本内容
         * @since MediaKit 3.3.1
         */
        body: string
      }) => void
    ): void
  }
  /**
   * 创建管理器
   * @public
   * @since MediaKit 3.3.1
   * @platform iOS Android
   */
  export function getRGBAudioManager(params: {
    /**
     * 间隔多长时间接收系统的录音信息(单位：ms)
     * @since MediaKit 3.5.0
     * @defaultValue 0
     */
    interval?: number
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
  }): GetRGBAudioManagerTask
}
