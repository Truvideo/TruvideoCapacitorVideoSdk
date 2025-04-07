package com.truvideo.video;

import static com.truvideo.sdk.video.TruvideoSdkVideo.TruvideoSdkVideo;

import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.gson.Gson;
import com.truvideo.sdk.video.interfaces.TruvideoSdkVideoCallback;
import com.truvideo.sdk.video.model.TruvideoSdkVideoFile;
import com.truvideo.sdk.video.model.TruvideoSdkVideoFileDescriptor;
import com.truvideo.sdk.video.model.TruvideoSdkVideoFrameRate;
import com.truvideo.sdk.video.model.TruvideoSdkVideoInformation;
import com.truvideo.sdk.video.model.TruvideoSdkVideoRequest;
import com.truvideo.sdk.video.video_request_builder.TruvideoSdkVideoConcatBuilder;
import com.truvideo.sdk.video.video_request_builder.TruvideoSdkVideoEncodeBuilder;
import com.truvideo.sdk.video.video_request_builder.TruvideoSdkVideoMergeBuilder;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import kotlinx.serialization.json.JsonArray;
import truvideo.sdk.common.exceptions.TruvideoSdkException;

@CapacitorPlugin(name = "TruvideoSdkVideo")
public class TruvideoSdkVideoPlugin extends Plugin {

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    ArrayList<String> filePaths(String videoUris) {
        JSONArray array = null;
        ArrayList<String> arrayList = new ArrayList<String>();
        try {
            array = new JSONArray(videoUris);
            for (int i = 0; i < array.length(); i++) {
                arrayList.add(array.get(i).toString());
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return arrayList;
    }
    @PluginMethod
    public void concatVideos(PluginCall call) {
        String resultPath = call.getString("resultPath");
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        TruvideoSdkVideoConcatBuilder builder = TruvideoSdkVideo.ConcatBuilder(listVideoFile(filePaths),videoFileDescriptor(resultPath));
        builder.build(new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result",new Gson().toJson(truvideoSdkVideoRequest));
                call.resolve(ret);
            }
            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);

            }
        });
    }

    @PluginMethod
    public void encodeVideo(PluginCall call)  {
        String resultPath = call.getString("resultPath");
        String filePaths = call.getString("videoUri");
        String config = call.getString("config");
        TruvideoSdkVideoEncodeBuilder builder = TruvideoSdkVideo.EncodeBuilder(videoFile(filePaths),videoFileDescriptor(resultPath));
        try {
            JSONObject configuration = new JSONObject(config);
            if(configuration.has("height")){
                builder.setHeight( configuration.getInt("height"));
            }
            if(configuration.has("width")){
                builder.setWidth( configuration.getInt("width"));
            }
            if(configuration.has("framesRate")){
                switch (configuration.getString("framesRate")){
                    case "twentyFourFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFourFps); break;
                    case "twentyFiveFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFiveFps); break;
                    case "thirtyFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.thirtyFps); break;
                    case "fiftyFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.fiftyFps); break;
                    case "sixtyFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.sixtyFps); break;
                    default: builder.setFramesRate(TruvideoSdkVideoFrameRate.defaultFrameRate);
                }
            }
//            if(configuration.has("videoCodec")){
//                switch (configuration.getString("videoCodec")){
//                    case "h264" : builder.set = TruvideoSdkVideoVideoCodec.h264
//                    case "h265" : builder.videoCodec = TruvideoSdkVideoVideoCodec.h265
//                    case "libx264" : builder.videoCodec = TruvideoSdkVideoVideoCodec.libx264
//                    default : result.videoCodec = TruvideoSdkVideoVideoCodec.defaultCodec
//                }
//            }
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        builder.build(new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result",new Gson().toJson(truvideoSdkVideoRequest));
                call.resolve(ret);
            }
            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);
            }
        });
    }

    @PluginMethod
    public void compareVideos(PluginCall call) {
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        TruvideoSdkVideo.compare(listVideoFile(filePaths), new TruvideoSdkVideoCallback<Boolean>() {
            @Override
            public void onComplete(Boolean aBoolean) {
                JSObject ret = new JSObject();
                ret.put("result",aBoolean);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);
            }
        });
    }

    @PluginMethod
    public void mergeVideos(PluginCall call)  {
        String resultPath = call.getString("resultPath");
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        String config = call.getString("config");
        TruvideoSdkVideoMergeBuilder builder = TruvideoSdkVideo.MergeBuilder(listVideoFile(filePaths),videoFileDescriptor(resultPath));
        try {
            JSONObject configuration = new JSONObject(config);
            if(configuration.has("height")){
                builder.setHeight( configuration.getInt("height"));
            }
            if(configuration.has("width")){
                builder.setWidth( configuration.getInt("width"));
            }
            if(configuration.has("framesRate")){
                switch (configuration.getString("framesRate")){
                    case "twentyFourFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFourFps); break;
                    case "twentyFiveFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFiveFps); break;
                    case "thirtyFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.thirtyFps); break;
                    case "fiftyFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.fiftyFps); break;
                    case "sixtyFps": builder.setFramesRate(TruvideoSdkVideoFrameRate.sixtyFps); break;
                    default: builder.setFramesRate(TruvideoSdkVideoFrameRate.defaultFrameRate);
                }
            }
//            if(configuration.has("videoCodec")){
//                switch (configuration.getString("videoCodec")){
//                    case "h264" : builder.set = TruvideoSdkVideoVideoCodec.h264
//                    case "h265" : builder.videoCodec = TruvideoSdkVideoVideoCodec.h265
//                    case "libx264" : builder.videoCodec = TruvideoSdkVideoVideoCodec.libx264
//                    default : result.videoCodec = TruvideoSdkVideoVideoCodec.defaultCodec
//                }
//            }
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        builder.build(new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result",new Gson().toJson(truvideoSdkVideoRequest));
                call.resolve(ret);
            }
            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);
            }
        });
    }

    @PluginMethod
    public void getVideoInfo(PluginCall call) {
        String videoPath = call.getString("videoPath");
        TruvideoSdkVideo.getInfo(videoFile(videoPath), new TruvideoSdkVideoCallback<TruvideoSdkVideoInformation>() {
            @Override
            public void onComplete(TruvideoSdkVideoInformation truvideoSdkVideoInformation) {
                JSObject ret = new JSObject();
                ret.put("result",new Gson().toJson(truvideoSdkVideoInformation));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);
            }
        });
    }


    @PluginMethod
    public void generateThumbnail(PluginCall call) {
        String videoPath = call.getString("videoPath");
        String resultPath = call.getString("resultPath");
        Long position = call.getLong("position");
        int width = call.getInt("width");
        int height = call.getInt("height");
        Boolean precise = call.getBoolean("precise");
        TruvideoSdkVideo.createThumbnail(videoFile(videoPath), videoFileDescriptor(resultPath), position, height, width, precise!=null?precise:false, new TruvideoSdkVideoCallback<String>() {
            @Override
            public void onComplete(String s) {
                JSObject ret = new JSObject();
                ret.put("result",s);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);
            }
        });
    }


    @PluginMethod
    public void cleanNoise(PluginCall call) {
        String videoPath = call.getString("videoPath");
        String resultPath = call.getString("resultPath");
        TruvideoSdkVideo.clearNoise(videoFile(videoPath), videoFileDescriptor(resultPath), new TruvideoSdkVideoCallback<String>() {
            @Override
            public void onComplete(String s) {
                JSObject ret = new JSObject();
                ret.put("result",s);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(),e);
            }
        });
    }

    @PluginMethod
    public void getResultPath(PluginCall call) {
        String path = call.getString("path");
        String basePath  = getContext().getFilesDir().getPath();
        JSObject ret = new JSObject();
        ret.put("filePath",new File(basePath+"/camera/"+path).getPath());
        call.resolve(ret);
    }
    public static PluginCall mainCall;
    @PluginMethod
    public void editVideo(PluginCall call){
        String videoUri = call.getString("videoPath");
        String resultPath = call.getString("resultPath");
        mainCall = call;
        getContext().startActivity(new Intent(getContext(), EditVideoActivity.class).putExtra("videoUri",videoUri).putExtra("resultPath",resultPath));
    }
    public TruvideoSdkVideoFile videoFile(String inputPath){
        return TruvideoSdkVideoFile.custom(inputPath);
    }

    public TruvideoSdkVideoFileDescriptor videoFileDescriptor(String outputPath){
        return TruvideoSdkVideoFileDescriptor.Companion.custom(outputPath);
    }

    public List<TruvideoSdkVideoFile> listVideoFile(List<String> list){
        List<TruvideoSdkVideoFile> listVideo = new ArrayList<TruvideoSdkVideoFile>();
        for (String video: list) {
            listVideo.add(videoFile(video));
        }
        return listVideo;
    }
}
