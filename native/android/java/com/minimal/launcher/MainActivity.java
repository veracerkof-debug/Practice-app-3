package com.minimal.launcher;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // свой плагин регистрируется до создания моста
        registerPlugin(LauncherPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
