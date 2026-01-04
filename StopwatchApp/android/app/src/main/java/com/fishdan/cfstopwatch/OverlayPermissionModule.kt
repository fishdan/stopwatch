package com.fishdan.cfstopwatch

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class OverlayPermissionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "OverlayPermission"

  @ReactMethod
  fun isGranted(promise: Promise) {
    try {
      promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
    } catch (e: Exception) {
      promise.reject("overlay_check_error", e)
    }
  }

  @ReactMethod
  fun requestPermission(promise: Promise) {
    try {
      if (Settings.canDrawOverlays(reactApplicationContext)) {
        promise.resolve(true)
        return
      }
      val intent = Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:${reactApplicationContext.packageName}"))
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve(false)
    } catch (e: Exception) {
      promise.reject("overlay_request_error", e)
    }
  }
}
