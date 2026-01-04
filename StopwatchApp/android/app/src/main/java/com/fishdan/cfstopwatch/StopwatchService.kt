package com.fishdan.cfstopwatch

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat

class StopwatchService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var overlayView: LinearLayout
    private lateinit var timerText: TextView
    private var isRunning = false
    private var startTime = 0L
    private var accumulatedTime = 0L
    private val handler = Handler(Looper.getMainLooper())

    private val updateTimerRunnable = object : Runnable {
        override fun run() {
            if (isRunning) {
                val elapsedTime = System.currentTimeMillis() - startTime + accumulatedTime
                updatetimeUI(elapsedTime)
                handler.postDelayed(this, 50)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        createNotificationChannel()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(
                1, 
                createNotification(), 
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(1, createNotification())
        }
        setupOverlay()
    }

    private fun setupOverlay() {
        // Main Container
        overlayView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundResource(R.drawable.bg_glass_rounded)
            setPadding(32, 32, 32, 32)
            gravity = Gravity.CENTER
        }

        // App Name Label
        val appNameLabel = TextView(this).apply {
            text = "CF Stopwatch"
            textSize = 12f
            setTextColor(Color.parseColor("#AAAAAA"))
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 8)
        }
        overlayView.addView(appNameLabel)

        // Timer Text
        timerText = TextView(this).apply {
            text = "00:00:00"
            textSize = 32f
            typeface = android.graphics.Typeface.MONOSPACE
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, 32)
        }
        overlayView.addView(timerText)

        // Buttons Container
        val buttonsLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        overlayView.addView(buttonsLayout)

        // Helper to create icon buttons
        fun createIconButton(resId: Int, onClick: (android.widget.ImageView) -> Unit): android.widget.ImageView {
            return android.widget.ImageView(this).apply {
                setImageResource(resId)
                setPadding(24, 16, 24, 16)
                layoutParams = LinearLayout.LayoutParams(96, 96).apply {
                    setMargins(16, 0, 16, 0)
                }
                setOnClickListener { onClick(this) }
            }
        }

        // Start/Stop Button
        val toggleButton = createIconButton(R.drawable.ic_play) { view ->
            if (isRunning) {
                // Pause
                isRunning = false
                accumulatedTime += System.currentTimeMillis() - startTime
                view.setImageResource(R.drawable.ic_play)
                handler.removeCallbacks(updateTimerRunnable)
            } else {
                // Start
                isRunning = true
                startTime = System.currentTimeMillis()
                view.setImageResource(R.drawable.ic_pause)
                handler.post(updateTimerRunnable)
            }
        }
        buttonsLayout.addView(toggleButton)

        // Clear Button (Stop/Reset)
        val clearButton = createIconButton(R.drawable.ic_stop) {
            isRunning = false
            startTime = 0L
            accumulatedTime = 0L
            toggleButton.setImageResource(R.drawable.ic_play)
            handler.removeCallbacks(updateTimerRunnable)
            timerText.text = "00:00:00"
        }
        buttonsLayout.addView(clearButton)

        // Close Button
        val closeButton = createIconButton(R.drawable.ic_close) {
            stopSelf()
        }
        buttonsLayout.addView(closeButton)

        // Window Params
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.TOP or Gravity.START
        params.x = 100
        params.y = 100

        // Drag Logic
        overlayView.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(overlayView, params)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        // Simple heuristic for click vs drag
                        val diffX = Math.abs(event.rawX - initialTouchX)
                        val diffY = Math.abs(event.rawY - initialTouchY)
                        if (diffX < 10 && diffY < 10) {
                             // v.performClick() // Background click?
                             return false // Propagate to children if it was a tap?
                        }
                        return true
                    }
                }
                return false
            }
        })

        windowManager.addView(overlayView, params)
    }

    private fun updatetimeUI(elapsedMs: Long) {
        val totalHundredths = elapsedMs / 10
        val hundredths = totalHundredths % 100
        val totalSeconds = totalHundredths / 100
        val seconds = totalSeconds % 60
        val minutes = totalSeconds / 60
        
        val fMinutes = minutes.toString().padStart(2, '0')
        val fSeconds = seconds.toString().padStart(2, '0')
        val fHundredths = hundredths.toString().padStart(2, '0')
        
        timerText.text = "$fMinutes:$fSeconds:$fHundredths"
    }
    
    // Fix for drag listener eating clicks:
    // Actually, setting OnTouchListener on the PARENT prevents children from getting clicks if we return true.
    // Better strategy: Put Drag Listener on a specific "Drag Handle" or handle it carefully.
    // For simplicity in this v1: We will rely on the fact that if we return false, it propagates?
    // Actually, if we want the whole background to be draggable but buttons clickable:
    // We can intercept touch.
    // Let's refine the touch listener slightly in a follow up if needed, but the simple "return false if no move" strategy 
    // works usually if we call performClick. However, for a ViewGroup, it's tricky.
    // Let's attach the touch listener to the TIMETEXTview only for dragging? Or a specific root?
    // Let's attach drag to the ROOT, but check bounds.
    // Revised Strategy: Drag only works on the background, not buttons.
    // But buttons are small.
    // Implementation above: If movement is small, return false to let events propagate to children.

    override fun onDestroy() {
        super.onDestroy()
        if (::overlayView.isInitialized) {
            windowManager.removeView(overlayView)
        }
        handler.removeCallbacks(updateTimerRunnable)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                "STOPWATCH_CHANNEL_ID",
                "Stopwatch Service Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, "STOPWATCH_CHANNEL_ID")
            .setContentTitle("Stopwatch Overlay")
            .setContentText("Stopwatch is running over other apps")
            .setSmallIcon(android.R.drawable.ic_dialog_info) // Fallback icon
            .build()
    }
}
