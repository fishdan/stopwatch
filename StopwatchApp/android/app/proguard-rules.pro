# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep our native modules
-keep class com.fishdan.cfstopwatch.** { *; }

# Keep React Native classes
-keep class com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class com.facebook.react.bridge.ReactMethod { *; }
-keep class com.facebook.react.bridge.Promise { *; }
-keep class com.facebook.react.bridge.ReactApplicationContext { *; }

# Keep Flipper out of release builds
-dontwarn com.facebook.flipper.**
-dontwarn com.facebook.react.flipper.**
