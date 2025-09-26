# truvideo-capacitor-video-sdk

Plugin for Video Module is capacitor js

## Install

```bash
npm install truvideo-capacitor-video-sdk
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`concatVideos(...)`](#concatvideos)
* [`encodeVideo(...)`](#encodevideo)
* [`getVideoInfo(...)`](#getvideoinfo)
* [`compareVideos(...)`](#comparevideos)
* [`mergeVideos(...)`](#mergevideos)
* [`cleanNoise(...)`](#cleannoise)
* [`editVideo(...)`](#editvideo)
* [`generateThumbnail(...)`](#generatethumbnail)
* [`getResultPath(...)`](#getresultpath)
* [`getRequestById(...)`](#getrequestbyid)
* [`processVideo(...)`](#processvideo)
* [`cancelVideo(...)`](#cancelvideo)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### concatVideos(...)

```typescript
concatVideos(options: { videoUris: string; resultPath: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code>{ videoUris: string; resultPath: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### encodeVideo(...)

```typescript
encodeVideo(options: { videoUri: string; resultPath: string; config: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| **`options`** | <code>{ videoUri: string; resultPath: string; config: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### getVideoInfo(...)

```typescript
getVideoInfo(options: { videoPath: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                |
| ------------- | ----------------------------------- |
| **`options`** | <code>{ videoPath: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### compareVideos(...)

```typescript
compareVideos(options: { videoUris: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                |
| ------------- | ----------------------------------- |
| **`options`** | <code>{ videoUris: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### mergeVideos(...)

```typescript
mergeVideos(options: { videoUris: string; resultPath: string; config: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code>{ videoUris: string; resultPath: string; config: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### cleanNoise(...)

```typescript
cleanNoise(options: { videoPath: string; resultPath: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code>{ videoPath: string; resultPath: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### editVideo(...)

```typescript
editVideo(options: { videoPath: string; resultPath: string; }) => Promise<{ result: object; }>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code>{ videoPath: string; resultPath: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### generateThumbnail(...)

```typescript
generateThumbnail(options: { videoPath: string; resultPath: string; position: number; width: number; height: number; precise: boolean; }) => Promise<{ result: object; }>
```

| Param         | Type                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ videoPath: string; resultPath: string; position: number; width: number; height: number; precise: boolean; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### getResultPath(...)

```typescript
getResultPath(options: { path: string; }) => Promise<{ result: string; }>
```

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ path: string; }</code> |

**Returns:** <code>Promise&lt;{ result: string; }&gt;</code>

--------------------


### getRequestById(...)

```typescript
getRequestById(options: { path: string; }) => Promise<{ result: string; }>
```

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ path: string; }</code> |

**Returns:** <code>Promise&lt;{ result: string; }&gt;</code>

--------------------


### processVideo(...)

```typescript
processVideo(options: { path: string; }) => Promise<{ result: object; }>
```

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ path: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------


### cancelVideo(...)

```typescript
cancelVideo(options: { path: string; }) => Promise<{ result: object; }>
```

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ path: string; }</code> |

**Returns:** <code>Promise&lt;{ result: object; }&gt;</code>

--------------------

</docgen-api>
