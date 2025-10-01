import Foundation
import Combine
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
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "filePaths", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "concatVideos", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "encodeVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "compareVideos", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mergeVideos", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "generateThumbnail", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cleanNoise", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVideoInfo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getResultPath", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "editVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "processVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelVideo", returnType: CAPPluginReturnPromise)
    ]
    
    var cancellables = Set<AnyCancellable>()
    
    @objc func echo(_ call: CAPPluginCall) {
        // Simply returns the same value received
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": value
        ])
    }
    
    @objc func editVideo(_ call: CAPPluginCall) {
        // Validates input parameters
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "resultPath is required")
            return
        }
        guard let videoUri = call.getString("videoPath") else {
            call.reject("INVALID_INPUT", "videoPath is required")
            return
        }
        
        DispatchQueue.main.async {
            // Fetch root view controller
            guard let rootViewController = UIApplication.shared.keyWindow?.rootViewController else {
                print("E_NO_ROOT_VIEW_CONTROLLER", "No root view controller found")
                return
            }
            
            // Prepare input and output paths for video editor
            let videoUrl = self.convertStringToURL(videoUri)
            let outputUrl = self.convertStringToURL(resultPath)
            let inputPath: TruvideoSdkVideoFile = .init(url: videoUrl)
            let outputPath: TruvideoSdkVideoFileDescriptor = .files(fileName: outputUrl.lastPathComponent)
            
            // Present the Truvideo SDK video editor
            rootViewController.presentTruvideoSdkVideoEditorView(input: inputPath, output: outputPath, onComplete: { editionResult in
                if(editionResult.editedVideoURL == nil){
                    call.resolve(["result": ""])
                }else{
                    call.resolve(["result": editionResult.editedVideoURL?.absoluteString ?? ""])
                    print("Successfully edited", editionResult.editedVideoURL?.absoluteString ?? "")
                }
            })
        }
    }
    // Converts a JSON string of video URIs to an array of strings
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
    
    @objc func getResultPath(_ call: CAPPluginCall) {
        // Returns a result path inside the app's 'output' folder
        let fileManager = FileManager.default
        
        guard let path = call.getString("path") else {
            call.reject("INVALID_INPUT", "path is required")
            return
        }
        
        do {
            let documentsURL = try fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            let outputFolderURL = documentsURL.appendingPathComponent("output")
            
            if !fileManager.fileExists(atPath: outputFolderURL.path) {
                try fileManager.createDirectory(at: outputFolderURL, withIntermediateDirectories: true, attributes: nil)
            }
            
            let resultPath = outputFolderURL.appendingPathComponent(path).path
            
            call.resolve([
                "result": resultPath
            ])
        } catch {
            call.reject("no_path", "Failed to get document directory path", error)
        }
    }
    
    // Converts a string path to a valid file URL
    func convertStringToURL(_ urlString: String) -> URL {
        // 1. Remove extra quotes
        let cleanedPath = urlString.trimmingCharacters(in: CharacterSet(charactersIn: "\""))
        
        // 2. Create URL from local file path
        let fileURL = URL(fileURLWithPath: cleanedPath)
        
        if FileManager.default.fileExists(atPath: fileURL.path) {
            return fileURL
        } else if let normalURL = URL(string: "file://\(cleanedPath)") {
            return normalURL
        } else {
            print("❌ Invalid URL string provided:", urlString)
            return URL(fileURLWithPath: "/dev/null") // Safe fallback
        }
    }
    
    // Creates an array of file URLs from an array of string paths
    func createUrlArray(videos: [String]) -> [URL] {
        var urlArray: [URL] = []
        for item in videos {
            urlArray.append(convertStringToURL(item))
        }
        return urlArray
    }
    @objc func concatVideos(_ call: CAPPluginCall) {
        // Concatenates multiple videos into one
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
                var inputUrl: [TruvideoSdkVideoFile] = []
                for url in videoUrl {
                    inputUrl.append(.init(url: url))
                }
                let outputPath: TruvideoSdkVideoFileDescriptor = .files(fileName: outputUrl.lastPathComponent)
                
                let builder = TruvideoSdkVideo.ConcatBuilder(input: inputUrl, output: outputPath)
                let result = try builder.build()
                call.resolve(["result": sendRequest(videoRequest: result)])
            }catch{
                call.reject("TruvideoSdkEceptionn",error.localizedDescription)
            }
        }
    }
    
    func sendRequests(videoRequests: [TruvideoSdkVideo.TruvideoSdkVideoRequest]) -> String {
          var responseArray: [[String: Any]] = []

          for request in videoRequests {
              let jsonString = sendRequest(videoRequest: request)
              if let data = jsonString.data(using: .utf8),
                 let dict = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                  responseArray.append(dict)
              }
          }

          do {
              let jsonData = try JSONSerialization.data(withJSONObject: responseArray, options: [])
              if let finalJsonString = String(data: jsonData, encoding: .utf8) {
                  print("json array", finalJsonString)
                  return finalJsonString
              }
          } catch {
              print("Error serializing requests: \(error)")
          }

          return "[]"
      }
    
    func sendRequest(videoRequest : TruvideoSdkVideo.TruvideoSdkVideoRequest) -> String{
        let dateFormatter = ISO8601DateFormatter()
        var type = videoRequest.type
        var typeString = ""
        if(type == .merge){
            typeString = "merge"
        }else if(type == .concat){
            typeString = "concat"
        }else {
            typeString = "encode"
        }
        var status : String =  switch videoRequest.status {
              case .idle : "idle"
              case .error: "error"
              case .complete: "completed"
              case .processing: "processing"
              case .cancelled: "canceled"
              default:""
            }
        let mainResponse: [String: String] = [
            "id": videoRequest.id.uuidString,
            "createdAt" : dateFormatter.string(from: videoRequest.createdAt),
            "status" : status,
            "type" : typeString,
            "updatedAt" : dateFormatter.string(from: videoRequest.updatedAt)
        ]
        print("Received request:", videoRequest)
        do{
            let jsonData = try JSONSerialization.data(withJSONObject: mainResponse, options: [])
            if let jsonString = String(data: jsonData, encoding: .utf8) {
                print("json",jsonString)
                return jsonString
            }else{
                return "{}"
            }
        }catch{
            return "{}"
        }
    }
    
    @objc func encodeVideo(_ call: CAPPluginCall) {
        // Encodes a video with given width, height, frame rate, and codec
        print("calls:", call)
        
        guard let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let videoUri = call.getString("videoUri") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        guard let config = call.getString("config") else {
            call.reject("INVALID_INPUT", "filePath is required")
            return
        }
        
        print("resultPath:", resultPath, "videoUri:", videoUri, "config:", config)
        
        Task {
            do {
                print("videoUrl:", videoUri)
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
                        
                        // Extract width and height
                        guard let widthStr = configuration["width"] as? String,
                              let width = CGFloat(Double(widthStr) ?? 0) as? CGFloat else {
                            print("Width is not a valid string or missing")
                            return
                        }
                        
                        guard let heightStr = configuration["height"] as? String,
                              let height = CGFloat(Double(heightStr) ?? 0) as? CGFloat else {
                            print("Height is not a valid string or missing")
                            return
                        }
                        
                        if let frameRateStr = configuration["framesRate"] as? String
                        {
                            let inputPath: TruvideoSdkVideoFile = .init(url: videoUrl)
                            let outputPath: TruvideoSdkVideoFileDescriptor = .files(fileName: outputUrl.lastPathComponent)
                            let builder = TruvideoSdkVideo.EncodingBuilder(input: inputPath, output: outputPath)
                            
                            builder.height = height
                            builder.width = width
                            builder.framesRate = frameRate(frameRateStr)
                            
                            let result = builder.build()
                            call.resolve(["result": sendRequest(videoRequest: result)])
                            //await print("Successfully encoded", output?.videoURL.absoluteString ?? "")
                        } else {
                            print("Invalid JSON format")
                            call.reject("json_error", "Invalid JSON format", nil)
                        }
                    }
                } catch {
                    print("Error parsing JSON: \(error.localizedDescription)")
                    call.reject("json_error", "Error parsing JSON", error)
                }
            }
        }
    }
    
    
    
    @objc func compareVideos(_ call: CAPPluginCall) {
        // Checks if multiple videos can be concatenated
        guard let videoUris = call.getString("videoUris") else {
            call.reject("INVALID_INPUT", "videoUris is required")
            return
        }
        
        let urlArray = createUrlArray(videos: filePaths(from: videoUris))
        
        Task {
            do {
                let inputUrl = urlArray.map { TruvideoSdkVideoFile(url: $0) }
                let isConcat = try await TruvideoSdkVideo.canConcat(input: inputUrl)
                call.resolve(["result": isConcat])
            } catch {
                call.reject("json_error", "Error checking video compatibility", error)
            }
        }
    }
    
    @objc func cancelVideo(_ call: CAPPluginCall) {
        // Checks if multiple videos can be concatenated
        guard let id = call.getString("path") else {
            call.reject("INVALID_INPUT", "id is required")
            return
        }
        var cancellables = Set<AnyCancellable>()
        do {
            let publisher = try TruvideoSdkVideo.streamRequest(withId: UUID(uuidString :id) ?? UUID())
            let dateFormatter = ISO8601DateFormatter()
            publisher
                .sink { videoRequest in
                    // Handle each emitted TruvideoSdkVideoRequest
                    do {
                        try videoRequest.cancel()
                        call.resolve(["result": self.sendRequest(videoRequest: videoRequest)])
                    }catch{
                        call.reject("TruvideoSdkExceptions","\(error.localizedDescription)",nil)
                    }
                    cancellables.removeAll()
                }
                .store(in: &cancellables)
            
        } catch {
            // Handle thrown error from streamRequest
            call.reject("json_error", "Error checking video compatibility", error)
            print("Failed to create publisher:", error)
        }
    }
    
    @objc func processVideo(_ call: CAPPluginCall) {
        guard let id = call.getString("path") else {
            call.reject("INVALID_INPUT", "id is required")
            return
        }
        
        do {
            try TruvideoSdkVideo.streamRequest(withId: UUID(uuidString: id) ?? UUID())
                .first() // ✅ only take the first emitted value
                .sink(receiveCompletion: { completion in
                    if case .failure(let error) = completion {
                        call.reject("STREAM_FAILED", error.localizedDescription)
                    }
                }, receiveValue: { videoRequest in
                    Task {
                        do {
                            let result =  try await videoRequest.process()
                            call.resolve(["result": self.sendRequest(videoRequest: videoRequest)])
                         //   call.resolve(["result": result.videoURL.absoluteString])
                            self.cancellables.removeAll()
                        }catch{
                            call.reject("TruvideoSdkExceptions","\(error.localizedDescription)",nil)
                        }
                    }
                })
                .store(in: &cancellables)
            
        } catch {
            call.reject("json_error", "Error checking video compatibility", error)
            print("Failed to create publisher:", error)
        }
    }
    
    @objc func getRequestById(_ call: CAPPluginCall) {
        // Checks if multiple videos can be concatenated
        guard let id = call.getString("id") else {
            call.reject("INVALID_INPUT", "id is required")
            return
        }
        var cancellables = Set<AnyCancellable>()
        do {
            let publisher = try TruvideoSdkVideo.streamRequest(withId: UUID(uuidString :id) ?? UUID())
            let dateFormatter = ISO8601DateFormatter()
            publisher
                .sink { videoRequest in
                    // Handle each emitted TruvideoSdkVideoRequest
                    var jsonString = self.sendRequest(videoRequest : videoRequest)
                    call.resolve(["result": self.sendRequest(videoRequest: videoRequest)])
                    cancellables.removeAll()
                }
                .store(in: &cancellables)
            
        } catch {
            // Handle thrown error from streamRequest
            call.reject("json_error", "Error checking video compatibility", error)
            print("Failed to create publisher:", error)
        }
    }
    
    @objc func getAllRequest(_ call: CAPPluginCall) {
        // Checks if multiple videos can be concatenated
        guard let status = call.getString("status") else {
            call.reject("INVALID_INPUT", "id is required")
            return
        }
        var cancellables = Set<AnyCancellable>()
        var statusData : TruvideoSdkVideoRequest.Status?
            if (status == "IDLE"){
              statusData = .idle
            }else if(status == "CANCELED"){
              statusData = .cancelled
            }else if(status == "COMPLETED"){
              statusData = .complete
            }else if(status == "ERROR"){
              statusData = .error
            }else if(status == "PROCESSING"){
              statusData = .processing
            }else {
              statusData = nil
            }
        
        let publisher = TruvideoSdkVideo.streamRequests(withStatus: statusData)
        //let dateFormatter = ISO8601DateFormatter()
        publisher
            .sink { videoRequest in
                // Handle each emitted TruvideoSdkVideoRequest
                let jsonString = self.sendRequests(videoRequests : videoRequest)
                call.resolve(["result": jsonString])
                cancellables.removeAll()
            }
            .store(in: &cancellables)
            
        
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
                    guard let frameRateStr = configuration["framesRate"] as? String else {
                        print("framesRate or videoCodec are not valid strings or missing")
                        return
                    }
                    var inputUrl : [TruvideoSdkVideoFile] = []
                    for url in videoUrl {
                        inputUrl.append(.init(url: url))
                    }
                    let outputPath :TruvideoSdkVideoFileDescriptor = .files(fileName:  outputUrl.lastPathComponent)
                    let builder = TruvideoSdkVideo.MergeBuilder(input: inputUrl, output: outputPath)
                    builder.width = width
                    builder.height = height
                    builder.framesRate = frameRate(frameRateStr)
                    let result = try builder.build()
                    call.resolve(["result": sendRequest(videoRequest: result)])
                } else {
                    print("Invalid JSON format")
                    call.reject("json_error", "Invalid JSON format", nil)
                }
            } catch {
                print("\(error.localizedDescription)")
                call.reject("merge exceptions", "\(error.localizedDescription)", error)
            }
        }
    }
    
    
    func frameRate(_ frameRateStr: String) -> TruvideoSdkVideo.TruvideoSdkVideoFrameRate {
        return switch frameRateStr {
        case "twentyFourFps": .twentyFourFps
        case "twentyFiveFps": .twentyFiveFps
        case "thirtyFps": .thirtyFps
        case "fiftyFps": .fiftyFps
        case "sixtyFps": .sixtyFps
        default: .fiftyFps
        }
    }
    
    @objc func generateThumbnail(_ call: CAPPluginCall) {
        guard let resultPath = call.getString("resultPath"),
              let videoPath = call.getString("videoPath"),
              let position = call.getDouble("position"),
              let height = call.getInt("height"),
              let width = call.getInt("width") else {
            call.reject("INVALID_INPUT", "Missing required parameters")
            return
        }
        
        Task {
            do {
                let videoUrl = self.convertStringToURL(videoPath)
                let inputPath = TruvideoSdkVideoFile(url: videoUrl)
                let outputUrl = self.convertStringToURL(resultPath)
                let outputPath = TruvideoSdkVideoFileDescriptor.files(fileName: outputUrl.lastPathComponent)
                
                // Generate a thumbnail
                let thumbnail = try await TruvideoSdkVideo.generateThumbnail(
                    input: inputPath,
                    output: outputPath,
                    position: position,
                    width: width,
                    height: height
                )
                
                print("Generated thumbnail:", thumbnail.generatedThumbnailURL.absoluteString)
                call.resolve(["result": thumbnail.generatedThumbnailURL.absoluteString])
                
            } catch {
                print("Thumbnail generation error:", error.localizedDescription)
                call.reject("json_error", "Error generating thumbnail", error)
            }
        }
    }
    @objc func cleanNoise(_ call: CAPPluginCall) {
        guard let videoPath = call.getString("videoPath"),
              let resultPath = call.getString("resultPath") else {
            call.reject("INVALID_INPUT", "videoPath and resultPath are required")
            return
        }
        
        let videoUrl = convertStringToURL(videoPath)
        let outputUrl = convertStringToURL(resultPath)
        
        Task {
            do {
                let inputPath = TruvideoSdkVideoFile(url: videoUrl)
                let outputPath = TruvideoSdkVideoFileDescriptor.files(fileName: outputUrl.lastPathComponent)
                
                let result = try await TruvideoSdkVideo.engine.clearNoiseForFile(input: inputPath, output: outputPath)
                
                print("Noise cleaned successfully:", result.fileURL.absoluteString)
                call.resolve(["result": result.fileURL.absoluteString])
                
            } catch {
                print("Noise cleaning error:", error.localizedDescription)
                call.reject("CLEAN_NOISE_ERROR", "Failed to clean noise", error)
            }
        }
    }
    
    @objc func getVideoInfo(_ call: CAPPluginCall) {
        guard let filePath = call.getString("videoPath") else {
            call.reject("INVALID_INPUT", "videoPath is required")
            return
        }
        Task {
            do {
                let urlArray: URL = convertStringToURL(filePath)
                var inputUrl : TruvideoSdkVideoFile = .init(url: urlArray)
                let videoInfo = try await TruvideoSdkVideo.getVideoInformation(input: inputUrl)
                
                
                let dictionaryResult : [String : Any] = [
                    "path": convertStringToURL(videoInfo.path).path,
                    "size": videoInfo.size,
                    "durationMillis": videoInfo.durationMillis,
                    "format": videoInfo.format,
                    "videoTracks": videoInfo.videoTracks.map { video in
                        return [
                            "index": video.index,
                            "width": video.width,
                            "height": video.height,
                            "rotatedWidth": video.rotatedWidth,
                            "rotatedHeight": video.rotatedHeight,
                            "codec": video.codec,
                            "codecTag": video.codecTag,
                            "pixelFormat": video.pixelFormat,
                            "bitRate": video.bitRate,
                            "frameRate": video.frameRate,
                            "rotation": video.rotation,
                            "durationMillis": video.durationMillis
                        ] as [String: Any]
                    },
                    "audioTracks": videoInfo.audioTracks.map { audio in
                        return [
                            "index": audio.index,
                            "codec": audio.codec,
                            "codecTag": audio.codecTag,
                            "sampleFormat": audio.sampleFormat,
                            "bitRate": audio.bitRate,
                            "sampleRate": audio.sampleRate,
                            "channels": audio.channels,
                            "channelLayout": audio.channelLayout,
                            "durationMillis": audio.durationMillis
                        ] as [String: Any]
                    }
                ]
                
                call.resolve(["result": dictionaryResult])
                //                  do{
                //                    let jsonData = try JSONSerialization.data(withJSONObject: dictionaryResult, options: [])
                //                      if let jsonString = String(data: jsonData, encoding: .utf8) {
                //                        print("json",jsonString)
                //                        resolve(jsonString)
                //                      }else{
                //                        resolve("{}")
                //                      }
                //                    }
                //                  } catch {
                //                      reject("SDK_Error", "get_Video_Info_Failed", error)
                //                  }
            }catch {
                print("Video info error:", error.localizedDescription)
                call.reject("VIDEO_INFO_ERROR", "Failed to retrieve video info", error)
            }
        }
    }
}
