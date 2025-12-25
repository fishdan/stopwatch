package com.stopwatchapp

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class StopwatchModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "StopwatchModule"
    }

    @ReactMethod
    fun start() {
        val intent = Intent(reactApplicationContext, StopwatchService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    @ReactMethod
    fun stop() {
        val intent = Intent(reactApplicationContext, StopwatchService::class.java)
        reactApplicationContext.stopService(intent)
    }
}
