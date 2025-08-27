package com.guraysfitness.hypertrophy;

import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.splashscreen.SplashScreen;
import org.apache.cordova.*;

public class MainActivity extends CordovaActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Install the splash screen
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        
        super.onCreate(savedInstanceState);

        // Enable hardware acceleration
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }

    @Override
    protected void onResume() {
        super.onResume();
        
        // Prevent screen from sleeping during workout
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    protected void onPause() {
        super.onPause();
        
        // Allow screen to sleep when app is not active
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @Override
    public void onBackPressed() {
        // Handle back button press
        // You can add custom logic here, for example:
        // - Ask user if they want to exit
        // - Navigate to previous screen in your web app
        
        // For now, use default behavior
        super.onBackPressed();
    }
}