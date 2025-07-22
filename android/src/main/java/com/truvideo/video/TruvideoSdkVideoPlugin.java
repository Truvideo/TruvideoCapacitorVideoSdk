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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kotlin.Unit;
import kotlinx.serialization.json.JsonArray;
import truvideo.sdk.common.exceptions.TruvideoSdkException;

@CapacitorPlugin(name = "TruvideoSdkVideo")
public class TruvideoSdkVideoPlugin extends Plugin {

    @PluginMethod
    public void echo(PluginCall call) {
        // Echoes back the received value
        String value = call.getString("value");
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    ArrayList<String> filePaths(String videoUris) {
        ArrayList<String> arrayList = new ArrayList<>();
        try {
            JSONArray array = new JSONArray(videoUris);
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
        // Concatenates multiple videos into one
        String resultPath = call.getString("resultPath");
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));

        TruvideoSdkVideoConcatBuilder builder = TruvideoSdkVideo.ConcatBuilder(
                listVideoFile(filePaths),
                videoFileDescriptor(resultPath)
        );

        builder.build(new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result",returnRequest(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    public String returnRequest(TruvideoSdkVideoRequest request) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", request.getId());
        map.put("createdAt", request.getCreatedAt());
        map.put("status", request.getStatus().name());
        map.put("type", request.getType().name());
        map.put("updatedAt", request.getUpdatedAt());

        return new Gson().toJson(map);
    }

    public JSObject returnRequestAsJSObject(TruvideoSdkVideoRequest request) {
    JSObject obj = new JSObject();
    obj.put("id", request.getId());
    obj.put("createdAt", request.getCreatedAt().toString());
    obj.put("status", request.getStatus().name());
    obj.put("type", request.getType().name());
    obj.put("updatedAt", request.getUpdatedAt().toString());
    return obj;
}

    @PluginMethod
    public void encodeVideo(PluginCall call) {
        // Encodes a video with optional configuration
        String resultPath = call.getString("resultPath");
        String filePaths = call.getString("videoUri");
        String config = call.getString("config");

        TruvideoSdkVideoEncodeBuilder builder = TruvideoSdkVideo.EncodeBuilder(
                videoFile(filePaths),
                videoFileDescriptor(resultPath)
        );

        try {
            JSONObject configuration = new JSONObject(config);

            if (configuration.has("height")) {
                builder.setHeight(configuration.getInt("height"));
            }
            if (configuration.has("width")) {
                builder.setWidth(configuration.getInt("width"));
            }
            if (configuration.has("framesRate")) {
                switch (configuration.getString("framesRate")) {
                    case "twentyFourFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFourFps);
                        break;
                    case "twentyFiveFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFiveFps);
                        break;
                    case "thirtyFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.thirtyFps);
                        break;
                    case "fiftyFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.fiftyFps);
                        break;
                    case "sixtyFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.sixtyFps);
                        break;
                    default:
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.defaultFrameRate);
                }
            }
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        builder.build(new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result",returnRequestAsJSObject(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }


    @PluginMethod
    public void compareVideos(PluginCall call) {
        // Compares multiple videos for equality
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));

        TruvideoSdkVideo.compare(listVideoFile(filePaths), new TruvideoSdkVideoCallback<Boolean>() {
            @Override
            public void onComplete(Boolean isEqual) {
                JSObject ret = new JSObject();
                ret.put("result", isEqual);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void mergeVideos(PluginCall call) {
        // Merges multiple videos into one with optional configuration
        String resultPath = call.getString("resultPath");
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        String config = call.getString("config");

        TruvideoSdkVideoMergeBuilder builder = TruvideoSdkVideo.MergeBuilder(
                listVideoFile(filePaths),
                videoFileDescriptor(resultPath)
        );

        try {
            JSONObject configuration = new JSONObject(config);

            if (configuration.has("height")) {
                builder.setHeight(configuration.getInt("height"));
            }
            if (configuration.has("width")) {
                builder.setWidth(configuration.getInt("width"));
            }
            if (configuration.has("framesRate")) {
                switch (configuration.getString("framesRate")) {
                    case "twentyFourFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFourFps);
                        break;
                    case "twentyFiveFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.twentyFiveFps);
                        break;
                    case "thirtyFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.thirtyFps);
                        break;
                    case "fiftyFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.fiftyFps);
                        break;
                    case "sixtyFps":
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.sixtyFps);
                        break;
                    default:
                        builder.setFramesRate(TruvideoSdkVideoFrameRate.defaultFrameRate);
                }
            }
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        builder.build(new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result", returnRequestAsJSObject(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void getRequestById(PluginCall call) {
        String requestId = call.getString("path");
        if(requestId == null){
            return;
        }
        TruvideoSdkVideo.getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result", returnRequest(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void processVideo(PluginCall call) {
        String requestId = call.getString("path");
        if(requestId == null){
            return;
        }
        TruvideoSdkVideo.getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                truvideoSdkVideoRequest.process(new TruvideoSdkVideoCallback<String>() {
                    @Override
                    public void onComplete(String s) {
                        JSObject ret = new JSObject();
                        ret.put("result", returnRequest(truvideoSdkVideoRequest));
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {

                    }
                });
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void delete(PluginCall call) {
        String requestId = call.getString("path");
        if(requestId == null){
            return;
        }
        TruvideoSdkVideo.getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                truvideoSdkVideoRequest.delete(new TruvideoSdkVideoCallback<Unit>() {
                    @Override
                    public void onComplete(Unit unit) {
                        JSObject ret = new JSObject();
                        ret.put("result", returnRequest(truvideoSdkVideoRequest));
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        call.reject(e.getMessage(), e);
                    }
                });
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void cancelVideo(PluginCall call) {
        String requestId = call.getString("path");
        if(requestId == null){
            return;
        }
        TruvideoSdkVideo.getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                truvideoSdkVideoRequest.cancel(new TruvideoSdkVideoCallback<Unit>() {
                    @Override
                    public void onComplete(Unit unit) {
                        JSObject ret = new JSObject();
                        ret.put("result", returnRequestAsJSObject(truvideoSdkVideoRequest));
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        call.reject(e.getMessage(), e);
                    }
                });
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }



    @PluginMethod
    public void getVideoInfo(PluginCall call) {
        // Retrieves video metadata information
        String videoPath = call.getString("videoPath");

        TruvideoSdkVideo.getInfo(videoFile(videoPath), new TruvideoSdkVideoCallback<TruvideoSdkVideoInformation>() {
            @Override
            public void onComplete(TruvideoSdkVideoInformation videoInfo) {
                JSObject ret = new JSObject();
                ret.put("result", videoInfo.toJson());
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void generateThumbnail(PluginCall call) {
        // Generates a thumbnail from a video at a specified position
        String videoPath = call.getString("videoPath");
        String resultPath = call.getString("resultPath");
        int position = call.getInt("position");
        int width = call.getInt("width");
        int height = call.getInt("height");
        Boolean precise = call.getBoolean("precise");

        TruvideoSdkVideo.createThumbnail(
                videoFile(videoPath),
                videoFileDescriptor(resultPath),
                position,
                height,
                width,
                precise != null ? precise : false,
                new TruvideoSdkVideoCallback<String>() {
                    @Override
                    public void onComplete(String thumbnailPath) {
                        JSObject ret = new JSObject();
                        ret.put("result", thumbnailPath);
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        call.reject(e.getMessage(), e);
                    }
                }
        );
    }


    @PluginMethod
    public void cleanNoise(PluginCall call) {
        // Cleans noise from a video and saves to a result path
        String videoPath = call.getString("videoPath");
        String resultPath = call.getString("resultPath");

        TruvideoSdkVideo.clearNoise(videoFile(videoPath), videoFileDescriptor(resultPath), new TruvideoSdkVideoCallback<String>() {
            @Override
            public void onComplete(String outputPath) {
                JSObject ret = new JSObject();
                ret.put("result", outputPath);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject(e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void getResultPath(PluginCall call) {
        // Generates a full file path under app's internal camera folder
        String path = call.getString("path");
        String basePath = getContext().getFilesDir().getPath();

        JSObject ret = new JSObject();
        ret.put("result", new File(basePath + "/camera/" + path).getPath());
        call.resolve(ret);
    }


    // Static variable to hold the PluginCall reference for further use
    public static PluginCall mainCall;

    @PluginMethod
    public void editVideo(PluginCall call) {
        // Get video and result paths from the PluginCall
        String videoUri = call.getString("videoPath");
        String resultPath = call.getString("resultPath");

        // Store the PluginCall reference for future use if needed
        mainCall = call;

        // Start the EditVideoActivity to edit the video
        getContext().startActivity(new Intent(getContext(), EditVideoActivity.class)
                .putExtra("videoUri", videoUri)
                .putExtra("resultPath", resultPath));
    }

    public TruvideoSdkVideoFile videoFile(String inputPath) {
        // Returns a TruvideoSdkVideoFile instance for a given input video path
        return TruvideoSdkVideoFile.custom(inputPath);
    }

    public TruvideoSdkVideoFileDescriptor videoFileDescriptor(String outputPath) {
        // Returns a TruvideoSdkVideoFileDescriptor for the given output path
        return TruvideoSdkVideoFileDescriptor.Companion.custom(outputPath);
    }

    public List<TruvideoSdkVideoFile> listVideoFile(List<String> list) {
        // Converts a list of video paths to a list of TruvideoSdkVideoFile instances
        List<TruvideoSdkVideoFile> listVideo = new ArrayList<>();
        for (String video : list) {
            listVideo.add(videoFile(video));
        }
        return listVideo;
    }

}
