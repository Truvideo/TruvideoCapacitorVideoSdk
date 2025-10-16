package com.truvideo.video

import com.truvideo.sdk.video.model.TruvideoSdkVideoRequestStatus

fun getStatus(status : TruvideoSdkVideoRequestStatus) : String{
    return when(status){
        TruvideoSdkVideoRequestStatus.IDLE -> "idle"
        TruvideoSdkVideoRequestStatus.PROCESSING -> "processing"
        TruvideoSdkVideoRequestStatus.ERROR -> "error"
        TruvideoSdkVideoRequestStatus.COMPLETE -> "complete"
        TruvideoSdkVideoRequestStatus.CANCELLED -> "cancelled"
    }
}

fun getStatus(status : String?) : TruvideoSdkVideoRequestStatus?{
    return when (status) {
        "cancelled" -> {
            TruvideoSdkVideoRequestStatus.CANCELLED
        }
        "processing" -> {
            TruvideoSdkVideoRequestStatus.PROCESSING
        }
        "complete" -> {
            TruvideoSdkVideoRequestStatus.COMPLETE
        }
        "idle" -> {
            TruvideoSdkVideoRequestStatus.IDLE
        }
        "error" -> {
            TruvideoSdkVideoRequestStatus.ERROR
        }
        else -> {
            null
        }
    }
}