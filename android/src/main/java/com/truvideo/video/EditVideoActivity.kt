package com.truvideo.video

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResultLauncher
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.getcapacitor.JSObject
import com.truvideo.sdk.video.model.TruvideoSdkVideoFile
import com.truvideo.sdk.video.model.TruvideoSdkVideoFileDescriptor
import com.truvideo.sdk.video.ui.activities.edit.TruvideoSdkVideoEditContract
import com.truvideo.sdk.video.ui.activities.edit.TruvideoSdkVideoEditParams
import com.truvideo.video.ui.theme.AndroidTheme
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class EditVideoActivity : ComponentActivity() {
    private lateinit var editVideoLauncher: ActivityResultLauncher<TruvideoSdkVideoEditParams>
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(name = "Android", modifier = Modifier.padding(innerPadding))
                }
            }
        }
        val videoUri = intent.getStringExtra("videoUri")
        val resultPath = intent.getStringExtra("resultPath")
//        val editScreen = TruvideoSdkVideo.initEditScreen(this)
        editVideoLauncher = registerForActivityResult(TruvideoSdkVideoEditContract()) { result ->
            // edited video its on 'resultPath'
            //TruvideoReactTurboVideoSdkModule.mainPromise!!.resolve(result)
            val ret = JSObject()
            ret.put("result", result)
            TruvideoSdkVideoPlugin.mainCall!!.resolve(ret)
            finish()
            Log.d("TAG", "editVideo: result=$result")
        }

        CoroutineScope(Dispatchers.Main).launch {
            editVideo(videoUri!!,resultPath!!)
        }

    }

    private fun editVideo(videoUri: String, resultPath: String) {
        // Edit video and save to resultPath
        val input = TruvideoSdkVideoFile.custom(videoUri)
        val output = TruvideoSdkVideoFileDescriptor.custom(resultPath)
        editVideoLauncher.launch(
            TruvideoSdkVideoEditParams(
                input = input,
                output = output
            )
        )

    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}
