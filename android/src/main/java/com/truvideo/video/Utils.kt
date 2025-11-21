package com.truvideo.video

import com.getcapacitor.JSObject
import com.truvideo.sdk.video.interfaces.TruvideoSdkVideoCallback
import com.truvideo.sdk.video.model.TruvideoSdkVideoRequest
import com.truvideo.sdk.video.model.TruvideoSdkVideoRequestStatus
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import truvideo.sdk.common.exceptions.TruvideoSdkException

fun getStatus(status : TruvideoSdkVideoRequestStatus) : String{
    return when(status){
        TruvideoSdkVideoRequestStatus.IDLE -> "idle"
        TruvideoSdkVideoRequestStatus.PROCESSING -> "processing"
        TruvideoSdkVideoRequestStatus.ERROR -> "error"
        TruvideoSdkVideoRequestStatus.COMPLETE -> "complete"
        TruvideoSdkVideoRequestStatus.CANCELLED -> "cancelled"
    }
}

fun getAllRe( callback: TruvideoSdkVideoCallback<List<TruvideoSdkVideoRequest>>){

    CoroutineScope(Dispatchers.IO).launch {
        try {
            val result = com.truvideo.sdk.video.TruvideoSdkVideo.getAllRequests()
            callback.onComplete(result)
        }catch (e : TruvideoSdkException) {
            callback.onError(e)
        }
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