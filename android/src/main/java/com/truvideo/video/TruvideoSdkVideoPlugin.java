package com.truvideo.video;

//import static com.truvideo.sdk.video.TruvideoSdkVideo.TruvideoSdkVideo;

import com.truvideo.sdk.video.TruvideoSdkVideo;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.Observer;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.truvideo.sdk.model.exceptions.TruvideoSdkException;
import com.truvideo.sdk.video.interfaces.TruvideoSdkVideoCallback;
import com.truvideo.sdk.video.model.TruvideoSdkVideoFile;
import com.truvideo.sdk.video.model.TruvideoSdkVideoFileDescriptor;
import com.truvideo.sdk.video.model.TruvideoSdkVideoFrameRate;
import com.truvideo.sdk.video.model.TruvideoSdkVideoInformation;
import com.truvideo.sdk.video.model.TruvideoSdkVideoRequest;
import com.truvideo.sdk.video.model.TruvideoSdkVideoRequestStatus;
import com.truvideo.sdk.video.video_request_builder.TruvideoSdkVideoConcatBuilder;
import com.truvideo.sdk.video.video_request_builder.TruvideoSdkVideoEncodeBuilder;
import com.truvideo.sdk.video.video_request_builder.TruvideoSdkVideoMergeBuilder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.File;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import kotlin.Unit;

@CapacitorPlugin(name = "TruvideoSdkVideo")
public class TruvideoSdkVideoPlugin extends Plugin {


    @PluginMethod
    public void getAllRequests(PluginCall call){
        String status = call.getString("status");
        TruvideoSdkVideoRequestStatus requestStatus = UtilsKt.getStatus(status);
        TruvideoSdkVideo.getInstance().getAllRequests(requestStatus, new TruvideoSdkVideoCallback<List<TruvideoSdkVideoRequest>>() {
            @Override
            public void onComplete(List<TruvideoSdkVideoRequest> requests) {
                JSObject ret = new JSObject();
                ret.put("result", returnRequests(requests));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                call.reject("Error getting all requests", e.getMessage());
            }
        });

    }

    @PluginMethod
    public void streamAllRequests(PluginCall call){
        String status = call.getString("status");
        TruvideoSdkVideoRequestStatus requestStatus = UtilsKt.getStatus(status);
        LiveData<List<TruvideoSdkVideoRequest>> requests  = TruvideoSdkVideo.getInstance().streamAllRequests(requestStatus);
        requests.observe(getActivity(), new Observer<List<TruvideoSdkVideoRequest>>() {
            @Override
            public void onChanged(List<TruvideoSdkVideoRequest> truvideoSdkVideoRequests) {
                JSObject ret = new JSObject();
                ret.put("result", returnRequests(truvideoSdkVideoRequests));
                sendEvent("AllStream",ret);
            }
        });
    }

    public void sendEvent(String event, JSObject object) {
        notifyListeners(event,object);
    }
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
                if (array.isNull(i)) {
                    continue;
                }
                String p = array.optString(i, "");
                if (!p.isEmpty()) {
                    arrayList.add(normalizeLocalVideoPath(p));
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return arrayList;
    }

    /**
     * Strips accidental wrapping quotes and maps {@code file://} URIs to a filesystem path for Media3.
     */
    private static String normalizeLocalVideoPath(String raw) {
        if (raw == null) {
            return null;
        }
        String p = raw.trim();
        while (p.length() >= 2 && p.startsWith("\"") && p.endsWith("\"")) {
            p = p.substring(1, p.length() - 1).trim();
        }
        while (p.length() >= 2 && p.startsWith("'") && p.endsWith("'")) {
            p = p.substring(1, p.length() - 1).trim();
        }
        if (p.startsWith("file:")) {
            try {
                Uri u = Uri.parse(p);
                String path = u.getPath();
                if (path != null && !path.isEmpty()) {
                    p = path;
                }
            } catch (Exception ignored) {
                // keep original p
            }
        }
        return p;
    }

    /**
     * Fails fast with a clear plugin error instead of Media3 "Unknown error" when the path is wrong.
     */
    private boolean assertReadableVideoFile(PluginCall call, String path) {
        if (path == null || path.isEmpty()) {
            call.reject("Video path is empty");
            return false;
        }
        if (path.startsWith("content:")) {
            return true;
        }
        File f = new File(path);
        if (!f.isFile() || !f.canRead()) {
            call.reject(
                "Video file not found or not readable (ENOENT). Path: "
                    + path
                    + ". Ensure the file exists before merge/encode and the path is not stale."
            );
            return false;
        }
        return true;
    }

    private boolean assertReadableVideoFiles(PluginCall call, List<String> paths) {
        for (String p : paths) {
            if (!assertReadableVideoFile(call, p)) {
                return false;
            }
        }
        return true;
    }


    @PluginMethod
    public void concatVideos(PluginCall call) {
        // Concatenates multiple videos into one
        String resultPath = call.getString("resultPath");
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        if (resultPath == null || resultPath.isEmpty()) {
            call.reject("resultPath is required");
            return;
        }
        if (filePaths.isEmpty()) {
            call.reject("videoUris must be a JSON array string with at least one file path");
            return;
        }
        if (!assertReadableVideoFiles(call, filePaths)) {
            return;
        }

        TruvideoSdkVideoConcatBuilder builder = TruvideoSdkVideo.getInstance().ConcatBuilder(
                listVideoFile(filePaths),
                videoOutputDescriptor(resultPath)
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
                rejectTruvideoSdk(call, e);
            }
        });
    }

    public String returnRequests(List<TruvideoSdkVideoRequest> request){
        JSONArray array = new JSONArray();
        for(TruvideoSdkVideoRequest r : request){
            String jsonString = returnRequest(r);
            try{
                array.put(new JSONObject(jsonString));
            }catch (JSONException e){
                //e.printStackTrace();
            }
        }
        return array.toString();
    }
    public String returnRequest(TruvideoSdkVideoRequest request) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", request.getId());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            map.put("createdAt", DateTimeFormatter.ISO_INSTANT.format(request.getCreatedAt().toInstant()));
            map.put("updateAt",DateTimeFormatter.ISO_INSTANT.format(request.getUpdatedAt().toInstant()));
        }else {
            map.put("createdAt", request.getCreatedAt());
            map.put("updateAt",request.getUpdatedAt());
        }
        //map.put("createdAt", request.getCreatedAt());
        map.put("status", UtilsKt.getStatus(request.getStatus()));

        map.put("type", request.getType().name().toLowerCase());
        //map.put("updatedAt", request.getUpdatedAt());
        return new Gson().toJson(map);
    }

    public JSObject returnRequestAsJSObject(TruvideoSdkVideoRequest request) {
        JSObject obj = new JSObject();
        obj.put("id", request.getId());
        //obj.put("createdAt", request.getCreatedAt().toString());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            obj.put("createdAt", DateTimeFormatter.ISO_INSTANT.format(request.getCreatedAt().toInstant()));
            obj.put("updateAt",DateTimeFormatter.ISO_INSTANT.format(request.getUpdatedAt().toInstant()));
        }else {
            obj.put("createdAt", request.getCreatedAt());
            obj.put("updateAt",request.getUpdatedAt());
        }
        obj.put("status", request.getStatus().name());
        obj.put("type", request.getType().name());
        //obj.put("updatedAt", request.getUpdatedAt().toString());
        return obj;
    }

    @PluginMethod
    public void encodeVideo(PluginCall call) {
        // Encodes a video with optional configuration
        String resultPath = call.getString("resultPath");
        String filePaths = call.getString("videoUri");
        String config = call.getString("config");
        if (filePaths == null || filePaths.isEmpty()) {
            call.reject("videoUri is required");
            return;
        }
        if (resultPath == null || resultPath.isEmpty()) {
            call.reject("resultPath is required");
            return;
        }
        if (config == null || config.isEmpty()) {
            config = "{}";
        }
        if (!assertReadableVideoFile(call, normalizeLocalVideoPath(filePaths))) {
            return;
        }

        TruvideoSdkVideoEncodeBuilder builder = TruvideoSdkVideo.getInstance().EncodeBuilder(
                videoFile(filePaths),
                videoOutputDescriptor(resultPath)
        );

        try {
            JSONObject configuration = new JSONObject(config);

            Integer h = optNonEmptyInt(configuration, "height");
            if (h != null) {
                builder.setHeight(h);
            }
            Integer w = optNonEmptyInt(configuration, "width");
            if (w != null) {
                builder.setWidth(w);
            }
            String framesRate = configuration.optString("framesRate", "");
            if (!framesRate.isEmpty()) {
                switch (framesRate) {
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
                ret.put("result",returnRequest(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }


    @PluginMethod
    public void compareVideos(PluginCall call) {
        // Compares multiple videos for equality
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        if (filePaths.isEmpty()) {
            call.reject("videoUris must be a JSON array string with at least one file path");
            return;
        }
        if (!assertReadableVideoFiles(call, filePaths)) {
            return;
        }

        TruvideoSdkVideo.getInstance().compare(listVideoFile(filePaths), true, new TruvideoSdkVideoCallback<Boolean>() {
            @Override
            public void onComplete(Boolean isEqual) {
                JSObject ret = new JSObject();
                ret.put("result", isEqual);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }

    @PluginMethod
    public void mergeVideos(PluginCall call) {
        // Merges multiple videos into one with optional configuration
        String resultPath = call.getString("resultPath");
        ArrayList<String> filePaths = filePaths(call.getString("videoUris"));
        String config = call.getString("config");
        if (resultPath == null || resultPath.isEmpty()) {
            call.reject("resultPath is required");
            return;
        }
        if (filePaths.isEmpty()) {
            call.reject("videoUris must be a JSON array string with at least one file path");
            return;
        }
        if (config == null || config.isEmpty()) {
            config = "{}";
        }
        if (!assertReadableVideoFiles(call, filePaths)) {
            return;
        }

        TruvideoSdkVideoMergeBuilder builder = TruvideoSdkVideo.getInstance().MergeBuilder(
                listVideoFile(filePaths),
                videoOutputDescriptor(resultPath)
        );

        try {
            JSONObject configuration = new JSONObject(config);

            Integer h = optNonEmptyInt(configuration, "height");
            if (h != null) {
                builder.setHeight(h);
            }
            Integer w = optNonEmptyInt(configuration, "width");
            if (w != null) {
                builder.setWidth(w);
            }
            String framesRate = configuration.optString("framesRate", "");
            if (!framesRate.isEmpty()) {
                switch (framesRate) {
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
                ret.put("result", returnRequest(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }

    @PluginMethod
    public void getRequestById(PluginCall call) {
        String requestId = call.getString("id");
        if (requestId == null) {
            call.reject("Invalid request id");
            return;
        }
        TruvideoSdkVideo.getInstance().getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                if (truvideoSdkVideoRequest == null) {
                    call.reject("Request not found");
                    return;
                }
                JSObject ret = new JSObject();
                ret.put("result", returnRequest(truvideoSdkVideoRequest));
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }

    @PluginMethod
    public void streamRequestById(PluginCall call) {
        String requestId = call.getString("path");
        if(requestId == null){
            return;
        }
        LiveData<TruvideoSdkVideoRequest> liveData = TruvideoSdkVideo.getInstance().streamRequestById(requestId);
        liveData.observe(getActivity(), new Observer<TruvideoSdkVideoRequest>() {
            @Override
            public void onChanged(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                JSObject ret = new JSObject();
                ret.put("result", returnRequest(truvideoSdkVideoRequest));
                sendEvent("stream",ret);
            }
        });
    }

    @PluginMethod
    public void processVideo(PluginCall call) {
        String requestId = call.getString("path");
        if (requestId == null) {
            call.reject("Path is required");
            return;
        }
        TruvideoSdkVideo.getInstance().getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                if (truvideoSdkVideoRequest == null) {
                    call.reject("Request not found");
                    return;
                }
                final TruvideoSdkVideoRequest requestToProcess = truvideoSdkVideoRequest;
                Runnable runProcess = () -> requestToProcess.process(true, new TruvideoSdkVideoCallback<String>() {
                    @Override
                    public void onComplete(String s) {
                        JSObject ret = new JSObject();
                        ret.put("result", returnRequest(requestToProcess));
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        rejectTruvideoSdk(call, e);
                    }
                });
                if (Looper.myLooper() == Looper.getMainLooper()) {
                    runProcess.run();
                } else {
                    new Handler(Looper.getMainLooper()).post(runProcess);
                }
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }

    @PluginMethod
    public void delete(PluginCall call) {
        String requestId = call.getString("path");
        if (requestId == null) {
            call.reject("Path is required");
            return;
        }
        TruvideoSdkVideo.getInstance().getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                if (truvideoSdkVideoRequest == null) {
                    call.reject("Request not found");
                    return;
                }
                truvideoSdkVideoRequest.delete(new TruvideoSdkVideoCallback<Unit>() {
                    @Override
                    public void onComplete(Unit unit) {
                        JSObject ret = new JSObject();
                        ret.put("result", returnRequest(truvideoSdkVideoRequest));
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        rejectTruvideoSdk(call, e);
                    }
                });
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }

    @PluginMethod
    public void cancelVideo(PluginCall call) {
        String requestId = call.getString("path");
        if (requestId == null) {
            call.reject("Path is required");
            return;
        }
        TruvideoSdkVideo.getInstance().getRequestById(requestId, new TruvideoSdkVideoCallback<TruvideoSdkVideoRequest>() {
            @Override
            public void onComplete(TruvideoSdkVideoRequest truvideoSdkVideoRequest) {
                if (truvideoSdkVideoRequest == null) {
                    call.reject("Request not found");
                    return;
                }
                truvideoSdkVideoRequest.cancel(true, new TruvideoSdkVideoCallback<Unit>() {
                    @Override
                    public void onComplete(Unit unit) {
                        JSObject ret = new JSObject();
                        ret.put("result", returnRequest(truvideoSdkVideoRequest));
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        rejectTruvideoSdk(call, e);
                    }
                });
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }



    @PluginMethod
    public void getVideoInfo(PluginCall call) {
        // Retrieves video metadata information
        String videoPath = call.getString("videoPath");
        if (!assertReadableVideoFile(call, normalizeLocalVideoPath(videoPath))) {
            return;
        }

        TruvideoSdkVideo.getInstance().getInfo(videoFile(videoPath), true, new TruvideoSdkVideoCallback<TruvideoSdkVideoInformation>() {
            @Override
            public void onComplete(TruvideoSdkVideoInformation videoInfo) {
                JSObject ret = new JSObject();
                ret.put("result", videoInfo.toJson());
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
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

        if (!assertReadableVideoFile(call, normalizeLocalVideoPath(videoPath))) {
            return;
        }

        TruvideoSdkVideo.getInstance().createThumbnail(
                videoFile(videoPath),
                videoFileDescriptor(resultPath),
                (long) position,
                height,
                width,
                precise != null ? precise : false,
                true,
                new TruvideoSdkVideoCallback<String>() {
                    @Override
                    public void onComplete(String thumbnailPath) {
                        JSObject ret = new JSObject();
                        ret.put("result", thumbnailPath);
                        call.resolve(ret);
                    }

                    @Override
                    public void onError(@NonNull TruvideoSdkException e) {
                        rejectTruvideoSdk(call, e);
                    }
                }
        );
    }


    @PluginMethod
    public void cleanNoise(PluginCall call) {
        // Cleans noise from a video and saves to a result path
        String videoPath = call.getString("videoPath");
        String resultPath = call.getString("resultPath");
        if (!assertReadableVideoFile(call, normalizeLocalVideoPath(videoPath))) {
            return;
        }

        TruvideoSdkVideo.getInstance().clearNoise(videoFile(videoPath), videoOutputDescriptor(resultPath), true, new TruvideoSdkVideoCallback<String>() {
            @Override
            public void onComplete(String outputPath) {
                JSObject ret = new JSObject();
                ret.put("result", outputPath);
                call.resolve(ret);
            }

            @Override
            public void onError(@NonNull TruvideoSdkException e) {
                rejectTruvideoSdk(call, e);
            }
        });
    }

    @PluginMethod
    public void getResultPath(PluginCall call) {
        // Generates a full file path under app's internal camera folder
        String path = call.getString("path");
        String basePath = getContext().getFilesDir().getPath();

        JSObject ret = new JSObject();
        ret.put("result", new File(basePath + "/" + path).getPath());
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
        if (inputPath == null || inputPath.isEmpty()) {
            return TruvideoSdkVideoFile.custom(inputPath);
        }
        return TruvideoSdkVideoFile.custom(normalizeLocalVideoPath(inputPath));
    }

    public TruvideoSdkVideoFileDescriptor videoFileDescriptor(String outputPath) {
        // Returns a TruvideoSdkVideoFileDescriptor for the given output path
        return TruvideoSdkVideoFileDescriptor.Companion.custom(outputPath);
    }

    /**
     * Output paths for muxed video (encode / merge / concat / cleanNoise) should use a real container
     * extension; the SDK often fails with a generic error otherwise.
     */
    public TruvideoSdkVideoFileDescriptor videoOutputDescriptor(String outputPath) {
        return TruvideoSdkVideoFileDescriptor.Companion.custom(ensureVideoOutputPath(outputPath));
    }

    private static String ensureVideoOutputPath(String outputPath) {
        if (outputPath == null || outputPath.isEmpty()) {
            return outputPath;
        }
        if (outputPath.matches("(?i).+\\.(mp4|mov|m4v|webm|mkv|3gp)$")) {
            return outputPath;
        }
        Log.w(
            "TruvideoSdkVideoPlugin",
            "resultPath has no recognized video extension; appending .mp4. Original: " + outputPath
        );
        return outputPath + ".mp4";
    }

    public List<TruvideoSdkVideoFile> listVideoFile(List<String> list) {
        // Converts a list of video paths to a list of TruvideoSdkVideoFile instances
        List<TruvideoSdkVideoFile> listVideo = new ArrayList<>();
        for (String video : list) {
            listVideo.add(videoFile(video));
        }
        return listVideo;
    }

    /**
     * Reads an int only when the key exists and string form is non-empty (JS often sends "").
     */
    private static Integer optNonEmptyInt(JSONObject o, String key) throws JSONException {
        if (!o.has(key) || o.isNull(key)) {
            return null;
        }
        String s = o.optString(key, "");
        if (s.isEmpty()) {
            return null;
        }
        return o.getInt(key);
    }

    private static String formatTruvideoMessage(@NonNull TruvideoSdkException e) {
        LinkedHashSet<String> parts = new LinkedHashSet<>();
        Throwable t = e;
        for (int depth = 0; depth < 8 && t != null; depth++) {
            String m = t.getMessage();
            if (m != null && !m.trim().isEmpty()) {
                parts.add(m.trim());
            }
            t = t.getCause();
        }
        String reflected = reflectSdkDiagnostics(e);
        if (reflected != null && !reflected.isEmpty()) {
            parts.add(reflected);
        }
        if (parts.isEmpty()) {
            return e.toString();
        }
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (sb.length() > 0) {
                sb.append(" | ");
            }
            sb.append(p);
        }
        String joined = sb.toString();
        boolean onlyGeneric = true;
        for (String p : parts) {
            if (!"unknown error".equalsIgnoreCase(p) && !"unknown error.".equalsIgnoreCase(p)) {
                onlyGeneric = false;
                break;
            }
        }
        if (onlyGeneric) {
            joined = joined + " [" + e.getClass().getName() + "]";
        }
        return joined;
    }

    /**
     * Some SDK versions only populate auxiliary fields instead of a useful {@link Throwable#getMessage()}.
     */
    private static String reflectSdkDiagnostics(Throwable root) {
        Throwable cur = root;
        while (cur != null) {
            for (String methodName : new String[]{"getCode", "getErrorCode", "getReason", "getDetails"}) {
                for (Class<?> c = cur.getClass(); c != null; c = c.getSuperclass()) {
                    try {
                        java.lang.reflect.Method m = c.getMethod(methodName);
                        m.setAccessible(true);
                        Object v = m.invoke(cur);
                        if (v != null) {
                            String s = v.toString().trim();
                            if (!s.isEmpty()) {
                                return methodName + "=" + s;
                            }
                        }
                    } catch (Exception ignored) {
                        // method not on this class
                    }
                }
            }
            cur = cur.getCause();
        }
        return null;
    }

    private static void rejectTruvideoSdk(PluginCall call, @NonNull TruvideoSdkException e) {
        String msg = formatTruvideoMessage(e);
        Log.e("TruvideoSdkVideoPlugin", "Truvideo SDK error: " + msg, e);
        call.reject(msg, e);
    }

}
