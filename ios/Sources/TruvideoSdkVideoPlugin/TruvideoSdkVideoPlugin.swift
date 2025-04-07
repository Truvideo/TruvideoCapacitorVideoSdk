import Foundation
import Capacitor
import TruvideoSdkVideo


/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(TruvideoSdkVideoPlugin)
public class TruvideoSdkVideoPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TruvideoSdkVideoPlugin"
    public let jsName = "TruvideoSdkVideo"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise)
    ]
   
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value
        ])
    }
    
    
    func filePaths(from videoUris: String) -> [String] {
        var arrayList = [String]()
        if let data = videoUris.data(using: .utf8) {
            do {
                if let jsonArray = try JSONSerialization.jsonObject(with: data, options: []) as? [Any] {
                    for item in jsonArray {
                        arrayList.append("\(item)")
                    }
                }
            } catch {
                print("JSON parsing error: \(error)")
            }
        }
        return arrayList
    }
    
    func convertStringToURL(_ urlString: String) -> URL{
       guard let url = URL(string: "file://\(urlString)") else {
           return  URL(string: urlString)!
       }
       return url
   }
   func createUrlArray(videos : [String]) -> [URL]{
       var urlArray: [URL] = []
       for item in videos {
           urlArray.append(convertStringToURL(item))
       }
       return urlArray
   }
    
    @objc func concatVideos(_ call: CAPPluginCall) {
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let videoUris = call.getString("videoUris") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        Task {
            do {
                let videoUrl = createUrlArray(videos: filePaths(from: videoUris))
                let outputUrl = convertStringToURL(resultPath)
                var inputUrl : [TruvideoSdkVideoFile] = []
                for url in videoUrl {
                    inputUrl.append(.init(url: url))
                }
                let outputPath :TruvideoSdkVideoFileDescriptor = .custom(rawPath: outputUrl.absoluteString)

                // Concatenate the videos using ConcatBuilder
                let builder = TruvideoSdkVideo.ConcatBuilder(input: inputUrl, output: outputPath)
                // Print the output path of the concatenated video
                let result = builder.build()
                do{
                    let response = try await result.process()
                    let jsonData = try JSONEncoder().encode(response.videoURL.absoluteString)
                    if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                        call.resolve(["result": jsonDict])
                    } else {
                        call.reject("JSON_ERROR", "Failed to serialize video info")
                    }
                    print("Successfully concatenated", response.videoURL.absoluteString)
                }catch let error {
                    print(error.localizedDescription)
                    call.reject("CONCAT_VIDEO_ERROR", "Failed to concat video", error)
                    //reject("Concat_error", error.localizedDescription, error)
                }
            }
        }
    }
    
    
    @objc func encodeVideo(_ call: CAPPluginCall) {
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let videoUri = call.getString("videoUris") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let config = call.getString("config") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        Task {
            do {
                let videoUrl = self.convertStringToURL(videoUri)
                let outputUrl = convertStringToURL(resultPath)
                guard let data = config.data(using: .utf8) else {
                    print("Invalid JSON string")
                    call.reject("json_error", "Invalid JSON string", nil)
                    return
                }
                do {
                    if let configuration = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                        print(configuration)
                        guard let widthStr = configuration["width"] as? String, let width = CGFloat(Double(widthStr) ?? 0) as? CGFloat else {
                            print("Width is not a valid string or missing")
                            return
                        }
                        
                        guard let heightStr = configuration["height"] as? String, let height = CGFloat(Double(heightStr) ?? 0) as? CGFloat else {
                            print("Height is not a valid string or missing")
                            return
                        }
                        
                        if let frameRateStr = configuration["framesRate"] as? String, let videoCodec = configuration["videoCodec"]{
                            let inputPath : TruvideoSdkVideoFile = .init(url: videoUrl)
                            let outputPath :TruvideoSdkVideoFileDescriptor = .custom(rawPath: outputUrl.absoluteString)
                            let builder = TruvideoSdkVideo.EncodingBuilder(input: inputPath, output: outputPath)
                            builder.height = height
                            builder.width = width
                            builder.framesRate = frameRate(frameRateStr)
                            let result = builder.build()
                            do{
                                let output = try? await result.process()
                                //call.resolve(output?.videoURL.absoluteString)
                                let jsonData = try JSONEncoder().encode(output?.videoURL.absoluteString)
                                if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                                    call.resolve(["result": jsonDict])
                                } else {
                                    call.reject("JSON_ERROR", "Failed to serialize video info")
                                }
                                await print("Successfully concatenated", output?.videoURL.absoluteString)
                            }
                        } else {
                            print("Invalid JSON format")
                            call.reject("json_error", "Invalid JSON format", nil)
                        }
                    }
                }catch {
                    print("Error parsing JSON: \(error.localizedDescription)")
                    call.reject("json_error", "Error parsing JSON", error)
                }
            }
        }
    }
    
    @objc func compareVideos(_ call: CAPPluginCall) {
        guard let videoUris = call.getString("videoUris") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        var urlArray = createUrlArray(videos: filePaths(from: videoUris))
        Task {
            do {
                var inputUrl : [TruvideoSdkVideoFile] = []
                for url in urlArray {
                    inputUrl.append(.init(url: url))
                }
                // Check if the videos can be concatenated using TruvideoSdkVideo
                let isConcat = try await TruvideoSdkVideo.canConcat(input: inputUrl)
                //resolve(isConcat)
                let jsonData = try JSONEncoder().encode(isConcat)
                if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                    call.resolve(["result": jsonDict])
                } else {
                    call.reject("JSON_ERROR", "Failed to serialize video info")
                }
            } catch {
                // If an error occurs, return false indicating concatenation is not possible
                call.reject("json_error", "Error parsing JSON", error)
            }
        }
    }
    
    
    @objc func mergeVideos(_ call: CAPPluginCall) {
        guard let videoUris = call.getString("videoUris") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "resultPath is required")
            return
        }
        guard let config = call.getString("config") else {
            call.reject("INVALID_INPUT", "config is required")
            return
        }
        var urlArray = createUrlArray(videos: filePaths(from: videoUris))
        Task {
            let videoUrl = self.createUrlArray(videos: filePaths(from: videoUris))
            let outputUrl = self.convertStringToURL(resultPath)
            guard let data = config.data(using: .utf8) else {
                print("Invalid JSON string")
                call.reject("json_error", "Invalid JSON string", nil)
                return
            }
            do {
                if let configuration = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    print(configuration)
                    
                    // Parse width and height from strings
                    guard let widthStr = configuration["width"] as? String, let width = CGFloat(Double(widthStr) ?? 0) as? CGFloat else {
                        print("Width is not a valid string or missing")
                        return
                    }
                    
                    guard let heightStr = configuration["height"] as? String, let height = CGFloat(Double(heightStr) ?? 0) as? CGFloat else {
                        print("Height is not a valid string or missing")
                        return
                    }
                    // Parse frameRate and videoCodec as strings
                    guard let frameRateStr = configuration["framesRate"] as? String,
                          let videoCodec = configuration["videoCodec"] as? String else {
                        print("framesRate or videoCodec are not valid strings or missing")
                        return
                    }
                    var inputUrl : [TruvideoSdkVideoFile] = []
                    for url in videoUrl {
                        inputUrl.append(.init(url: url))
                    }
                    let outputPath :TruvideoSdkVideoFileDescriptor = .custom(rawPath: outputUrl.absoluteString)
                    let builder = TruvideoSdkVideo.MergeBuilder(input: inputUrl, output: outputPath)
                    builder.width = width
                    builder.height = height
                    builder.framesRate = frameRate(frameRateStr)
                    let result = builder.build()
                    do {
                        if let output = try? await result.process() {
                            //resolve(output.videoURL.absoluteString)
                            let jsonData = try JSONEncoder().encode(output.videoURL.absoluteString)
                            if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                                call.resolve(["result": jsonDict])
                            } else {
                                call.reject("JSON_ERROR", "Failed to serialize video info")
                            }
                            //await print("Successfully merge", output.videoURL.absoluteString)
                        }

                    } catch {
                        call.reject("process_error", "Failed to process video merge: \(error.localizedDescription)", error)
                    }
                } else {
                    print("Invalid JSON format")
                    call.reject("json_error", "Invalid JSON format", nil)
                }
            } catch {
                print("JSON parsing error: \(error.localizedDescription)")
                call.reject("json_error", "JSON parsing error: \(error.localizedDescription)", error)
            }
        }
    }
    
    func frameRate(_ frameRateStr: String ) -> TruvideoSdkVideo.TruvideoSdkVideoFrameRate{
            return switch frameRateStr {
            case "twentyFourFps":
                    .twentyFourFps
            case "twentyFiveFps":
                    .twentyFiveFps
            case "thirtyFps":
                    .thirtyFps
            case "fiftyFps":
                    .fiftyFps
            case "sixtyFps":
                    .sixtyFps
            default :
                    .fiftyFps
            }
        }

    
    
    @objc func generateThumbnail(_ call: CAPPluginCall) {
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let videoPath = call.getString("videoPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let position = call.getString("position") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let height = call.getString("height") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let width = call.getString("width") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let precise = call.getString("precise") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }

        if let positionTime = Double(position){
            Task{
                do {
                    let videoUrl = self.convertStringToURL(videoPath)
                    let inputPath : TruvideoSdkVideoFile = try .init(url: videoUrl)
                    let outputUrl = self.convertStringToURL(resultPath)
                    let outputPath :TruvideoSdkVideoFileDescriptor = .custom(rawPath: outputUrl.absoluteString)
                    // Generate a thumbnail for the provided video using TruvideoSdkVideo's thumbnailGenerator
                    let thumbnail = try await TruvideoSdkVideo.generateThumbnail(input: inputPath, output: outputPath, position: positionTime, width: Int(width), height: Int(height))
                    //resolve(thumbnail.generatedThumbnailURL.absoluteString)
                    // Handle result - thumbnail.generatedThumbnailURL
                    let jsonData = try JSONEncoder().encode(thumbnail.generatedThumbnailURL.absoluteString)
                    if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                        call.resolve(["result": jsonDict])
                    } else {
                        call.reject("JSON_ERROR", "Failed to serialize video info")
                    }
                } catch {
                    call.reject("json_error", "Error parsing JSON", error)
                    // Handle any errors that occur during the thumbnail generation process
                }
            }
        }
    }
    
    @objc func cleanNoise(_ call: CAPPluginCall) {
        guard let videoPath = call.getString("videoPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }

        let videoUrl = convertStringToURL(videoPath)
        let outputUrl = convertStringToURL(resultPath)
        Task{
            do {
                let inputPath : TruvideoSdkVideoFile = .init(url: videoUrl)
                let outputPath :TruvideoSdkVideoFileDescriptor = .custom(rawPath: outputUrl.absoluteString)
                // Attempt to clean noise from the input video file using TruvideoSdkVideo's engine
                let result = try await TruvideoSdkVideo.engine.clearNoiseForFile(input: inputPath, output: outputPath)
                //resolve(result.fileURL.absoluteString)
                let jsonData = try JSONEncoder().encode(result.fileURL.absoluteString)
                if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                    call.resolve(["result": jsonDict])
                } else {
                    call.reject("JSON_ERROR", "Failed to serialize video info")
                }
            } catch {
                call.reject("json_error", "Error parsing JSON", error)
                // Handle any errors that occur during the noise cleaning process
            }
        }
    }
    
    @objc func getVideoInfo(_ call: CAPPluginCall) {
        guard let filePath = call.getString("videoPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }

        Task {
            do {
                // Convert file path to URL and create TruvideoSdkVideoFile object
                let fileURL = URL(fileURLWithPath: filePath)
                let videoFile = TruvideoSdkVideoFile(url: fileURL)

                // Fetch video information
//                let videoInfo = try await  TruvideoSdkVideo.getVideosInformation(input: [videoFile])
                let videoInfo = try await TruvideoSdkVideo.getVideosInformation(input: [videoFile])
                // Convert result to JSON-serializable format
                let jsonData = try JSONEncoder().encode(videoInfo.description)
                if let jsonDict = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [[String: Any]] {
                    call.resolve(["result": jsonDict])
                } else {
                    call.reject("JSON_ERROR", "Failed to serialize video info")
                }
            } catch {
                call.reject("VIDEO_INFO_ERROR", "Failed to retrieve video info", error)
            }
        }
    }

}
