/**
 * P2PKit
 *
 * @version 7.7.6
 */
declare namespace ty.p2p {
  /**
   * P2P SDK init
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function P2PSDKInit(params?: {
    /**
     * user id
     * @since P2PKit 0.0.1
     */
    userId?: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * P2P connect
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function connectDevice(params: {
    /**
     * device id
     * @since P2PKit 0.0.1
     */
    deviceId: string
    /**
     * connect mode,0:INTERNET  1:LAN
     * @since P2PKit 0.0.1
     * @defaultValue 0
     */
    mode?: number
    /**
     * timeout,unit：ms, default as Internet：15000ms,Lan：3000ms
     * @since P2PKit 0.0.1
     * @defaultValue 0
     */
    timeout?: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * check P2P status
   * @public
   * @since P2PKit 2.0.3
   * @platform iOS Android
   */
  export function isP2PActive(params: {
    /**
     * device id
     * @since P2PKit 2.0.3
     */
    deviceId: string
    /**
     * connect mode,0:INTERNET  1:LAN
     * @since P2PKit 2.0.3
     * @defaultValue 0
     */
    mode?: number
    /**
     * timeout,unit：ms, default as Internet：15000ms,Lan：3000ms
     * @since P2PKit 2.0.3
     * @defaultValue 0
     */
    timeout?: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * check P2P status
   * @public
   * @since P2PKit 2.0.3
   * @platform iOS Android
   */
  export function isP2PActiveSync(params?: ThingP2PConnectionParams): null

  /**
   * query device's album file index infos
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function queryAlbumFileIndexs(params: {
    /**
     * device id
     * @since P2PKit 1.0.0
     */
    deviceId: string
    /**
     * albumName,given by the device
     * @since P2PKit 1.0.0
     */
    albumName: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: {
      /**
       * file count
       * @since P2PKit 2.0.2
       */
      count: number
      /**
       * file index infos
       * @since P2PKit 2.0.2
       */
      items: ThingP2PAlbumFileIndex[]
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
   * upload file
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function uploadFile(params: {
    /**
     * device id
     * @since P2PKit 0.0.1
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 0.0.1
     */
    albumName: string
    /**
     * local file path
     * @since P2PKit 0.0.1
     */
    filePath: string
    /**
     * ext data
     * @since P2PKit 0.0.1
     */
    extData?: string
    /**
     * ext data length
     * @since P2PKit 0.0.1
     */
    extDataLength?: number
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * download file
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function downloadFile(params: {
    /**
     * device id
     * @since P2PKit 1.0.0
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 1.0.0
     */
    albumName: string
    /**
     * local file path
     * @since P2PKit 1.0.0
     */
    filePath: string
    /**
     * file name jsons，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     * @since P2PKit 1.0.0
     */
    jsonfiles: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * download file stream
   * @public
   * @since P2PKit 2.0.2
   * @platform iOS Android
   */
  export function downloadStream(params: {
    /**
     * device id
     * @since P2PKit 2.0.2
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 2.0.2
     */
    albumName: string
    /**
     * file name jsons，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     * @since P2PKit 2.0.2
     */
    jsonfiles: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * append download file stream
   * @public
   * @since P2PKit 2.1.0
   * @platform iOS Android
   */
  export function appendDownloadStream(params: {
    /**
     * device id
     * @since P2PKit 2.1.0
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 2.1.0
     */
    albumName: string
    /**
     * file name jsons，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     * @since P2PKit 2.1.0
     */
    jsonfiles: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * cancel upload task
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function cancelUploadTask(params: {
    /**
     * device id
     * @since P2PKit 0.0.1
     */
    deviceId: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * cancel download task
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function cancelDownloadTask(params: {
    /**
     * device id
     * @since P2PKit 1.0.0
     */
    deviceId: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * P2P disconnect
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function disconnectDevice(params: {
    /**
     * device id
     * @since P2PKit 0.0.1
     */
    deviceId: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * P2P SDK deinit
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function deInitSDK(params?: {
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: () => void
    /** 接口调用成功的回调函数 */
    success?: (params: null) => void
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
   * P2P status changed event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function onSessionStatusChange(
    listener: (params: ThingP2PSessionStatus) => void
  ): void

  /**
   * P2P status changed event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function offSessionStatusChange(
    listener: (params: ThingP2PSessionStatus) => void
  ): void

  /**
   * upload file progress event
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function onUploadProgressUpdate(
    listener: (params: ProgressEvent) => void
  ): void

  /**
   * upload file progress event
   * @public
   * @since P2PKit 0.0.1
   * @platform iOS Android
   */
  export function offUploadProgressUpdate(
    listener: (params: ProgressEvent) => void
  ): void

  /**
   * single file download progress event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function onDownloadProgressUpdate(
    listener: (params: DownloadProgressEvent) => void
  ): void

  /**
   * single file download progress event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function offDownloadProgressUpdate(
    listener: (params: DownloadProgressEvent) => void
  ): void

  /**
   * total download progress event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function onDownloadTotalProgressUpdate(
    listener: (params: DownloadTotalProgressEvent) => void
  ): void

  /**
   * total download progress event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function offDownloadTotalProgressUpdate(
    listener: (params: DownloadTotalProgressEvent) => void
  ): void

  /**
   * single file download completed event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function onFileDownloadComplete(
    listener: (params: FileDownloadCompletionEvent) => void
  ): void

  /**
   * single file download completed event
   * @public
   * @since P2PKit 1.0.0
   * @platform iOS Android
   */
  export function offFileDownloadComplete(
    listener: (params: FileDownloadCompletionEvent) => void
  ): void

  /**
   * download packet received event
   * @public
   * @since P2PKit 2.0.2
   * @platform iOS Android
   */
  export function onStreamPacketReceive(
    listener: (params: StreamDownloadPacketReceivedEvent) => void
  ): void

  /**
   * download packet received event
   * @public
   * @since P2PKit 2.0.2
   * @platform iOS Android
   */
  export function offStreamPacketReceive(
    listener: (params: StreamDownloadPacketReceivedEvent) => void
  ): void

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PInitConfigParams {
    /**
     * user id
     * @since P2PKit 2.0.0
     */
    userId?: string
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PConnectionParams {
    /**
     * device id
     * @since P2PKit 2.0.3
     */
    deviceId: string
    /**
     * connect mode,0:INTERNET  1:LAN
     * @since P2PKit 2.0.3
     * @defaultValue 0
     */
    mode?: number
    /**
     * timeout,unit：ms, default as Internet：15000ms,Lan：3000ms
     * @since P2PKit 2.0.3
     * @defaultValue 0
     */
    timeout?: number
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PAlbum {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
    /**
     * albumName,given by the device
     * @since P2PKit 2.0.0
     */
    albumName: string
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PAlbumFileIndex {
    /**
     * idx,given by the device
     * @since P2PKit 2.0.2
     */
    idx: number
    /**
     * channel channel number
     * @since P2PKit 2.0.2
     */
    channel: number
    /**
     * type file type,0: image，2: mp4, 3: Panoramic stitching file
     * @since P2PKit 2.0.2
     */
    type: number
    /**
     * dir 0: file，1: directory
     * @since P2PKit 2.0.2
     */
    dir: number
    /**
     * file name contains suffix
     * @since P2PKit 2.0.2
     */
    filename: string
    /**
     * createTime file create time
     * @since P2PKit 2.0.2
     */
    createTime: number
    /**
     * duration file duration
     * @since P2PKit 2.0.2
     */
    duration: number
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PAlbumFileIndexs {
    /**
     * file count
     * @since P2PKit 2.0.0
     */
    count: number
    /**
     * file index infos
     * @since P2PKit 2.0.0
     */
    items: ThingP2PAlbumFileIndex[]
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PUploadFile {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 2.0.0
     */
    albumName: string
    /**
     * local file path
     * @since P2PKit 2.0.0
     */
    filePath: string
    /**
     * ext data
     * @since P2PKit 2.0.0
     */
    extData?: string
    /**
     * ext data length
     * @since P2PKit 2.0.0
     */
    extDataLength?: number
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PDownloadFile {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 2.0.0
     */
    albumName: string
    /**
     * local file path
     * @since P2PKit 2.0.0
     */
    filePath: string
    /**
     * file name jsons，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     * @since P2PKit 2.0.0
     */
    jsonfiles: string
  }

  /** @since P2PKit 2.0.2 */
  export interface ThingP2PDownloadStream {
    /**
     * device id
     * @since P2PKit 2.0.2
     */
    deviceId: string
    /**
     * albumName given by the device
     * @since P2PKit 2.0.2
     */
    albumName: string
    /**
     * file name jsons，eg: {"files":["filesname1", "filesname2", "filesname3" ]}
     * @since P2PKit 2.0.2
     */
    jsonfiles: string
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PSessionStatus {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
    /**
     * status, status < 0 means disconnected
     * @since P2PKit 2.0.0
     */
    status: number
  }

  /** @since P2PKit 0.0.1 */
  export interface ProgressEvent {
    /**
     * device id
     * @since P2PKit 0.0.1
     */
    deviceId: string
    /**
     * local file path
     * @since P2PKit 0.0.1
     */
    filePath: string
    /**
     * upload/download progress
     * @since P2PKit 0.0.1
     */
    progress: number
  }

  /** @since P2PKit 1.0.0 */
  export interface DownloadProgressEvent {
    /**
     * device id
     * @since P2PKit 1.0.0
     */
    deviceId: string
    /**
     * file name on downloading
     * @since P2PKit 1.0.0
     */
    fileName: string
    /**
     * upload/download progress
     * @since P2PKit 1.0.0
     */
    progress: number
  }

  /** @since P2PKit 1.0.0 */
  export interface DownloadTotalProgressEvent {
    /**
     * device id
     * @since P2PKit 1.0.0
     */
    deviceId: string
    /**
     * upload/download progress
     * @since P2PKit 1.0.0
     */
    progress: number
  }

  /** @since P2PKit 1.0.0 */
  export interface FileDownloadCompletionEvent {
    /**
     * device id
     * @since P2PKit 1.0.0
     */
    deviceId: string
    /**
     * file name
     * @since P2PKit 1.0.0
     */
    fileName: string
    /**
     * index
     * @since P2PKit 1.0.0
     */
    index: number
  }

  /** @since P2PKit 2.0.2 */
  export interface StreamDownloadPacketReceivedEvent {
    /**
     * device id
     * @since P2PKit 2.0.2
     */
    deviceId: string
    /**
     * total files count
     * @since P2PKit 2.0.2
     */
    totalFiles: number
    /**
     * file name
     * @since P2PKit 2.0.2
     */
    fileName: string
    /**
     * file index, dirty data
     * @since P2PKit 2.0.2
     */
    fileIndex: number
    /**
     * file length
     * @since P2PKit 2.0.2
     */
    fileLength: number
    /**
     * packet data
     * @since P2PKit 2.0.2
     */
    packetData: string
    /**
     * packet data length
     * @since P2PKit 2.0.2
     */
    packetLength: number
    /**
     * file serial number
     * @since P2PKit 2.0.2
     */
    fileSerialNumber: number
    /**
     * packet index
     * @since P2PKit 2.0.2
     */
    packetIndex: number
    /**
     * packet header/packet tail 0b00XY Y:packet header  X:packet tail
     * @since P2PKit 2.0.2
     */
    packetType: number
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PUploadTask {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PDownloadTask {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
  }

  /** @since P2PKit 2.0.0 */
  export interface ThingP2PDevice {
    /**
     * device id
     * @since P2PKit 2.0.0
     */
    deviceId: string
  }
}
