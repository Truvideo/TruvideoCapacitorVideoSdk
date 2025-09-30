package com.truvideo.video

import com.truvideo.sdk.video.model.TruvideoSdkVideoRequestStatus

fun getStatus(status : TruvideoSdkVideoRequestStatus) : String{
    return when(status){
        TruvideoSdkVideoRequestStatus.IDLE -> "idle"
        TruvideoSdkVideoRequestStatus.PROCESSING -> "processing"
        TruvideoSdkVideoRequestStatus.ERROR -> "error"
        TruvideoSdkVideoRequestStatus.COMPLETED -> "complete"
        TruvideoSdkVideoRequestStatus.CANCELED -> "cancelled"
    }
}

fun getStatus(status : String?) : TruvideoSdkVideoRequestStatus?{
    return when (status) {
        "cancelled" -> {
            TruvideoSdkVideoRequestStatus.CANCELED
        }
        "processing" -> {
            TruvideoSdkVideoRequestStatus.PROCESSING
        }
        "complete" -> {
            TruvideoSdkVideoRequestStatus.COMPLETED
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