package com.fishdan.cfstopwatch

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings

class LauncherActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Settings.canDrawOverlays(this)) {
            // Already have permission - silent launch of the service
            val intent = Intent(this, StopwatchService::class.java)
            startForegroundService(intent)
        } else {
            // No permission - show the setup UI
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }

        // Close the launcher immediately without any animation
        finish()
        overridePendingTransition(0, 0)
    }
}
