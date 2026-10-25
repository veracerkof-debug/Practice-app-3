package com.minimal.launcher;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.media.session.PlaybackState;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

// Мост лаунчера: «что играет» (медиасессии) и чтение файла из папки, выбранной пользователем (SAF).
@CapacitorPlugin(name = "Launcher")
public class LauncherPlugin extends Plugin {

    // ——— Плеер ———

    private boolean hasMediaAccess() {
        return NotificationManagerCompat.getEnabledListenerPackages(getContext()).contains(getContext().getPackageName());
    }

    private static boolean isPlaying(MediaController c) {
        PlaybackState st = c.getPlaybackState();
        return st != null && st.getState() == PlaybackState.STATE_PLAYING;
    }

    // играющая сессия, иначе первая с метаданными
    private MediaController activeController() {
        MediaSessionManager m = (MediaSessionManager) getContext().getSystemService(Context.MEDIA_SESSION_SERVICE);
        List<MediaController> list = m.getActiveSessions(new ComponentName(getContext(), MediaListener.class));
        MediaController fallback = null;
        for (MediaController c : list) {
            if (isPlaying(c)) return c;
            if (fallback == null && c.getMetadata() != null) fallback = c;
        }
        return fallback;
    }

    @PluginMethod
    public void mediaState(PluginCall call) {
        JSObject r = new JSObject();
        boolean access = hasMediaAccess();
        r.put("access", access);
        r.put("active", false);
        if (!access) {
            call.resolve(r);
            return;
        }
        try {
            MediaController c = activeController();
            if (c != null) {
                r.put("active", true);
                r.put("playing", isPlaying(c));
                MediaMetadata md = c.getMetadata();
                if (md != null) {
                    r.put("title", md.getString(MediaMetadata.METADATA_KEY_TITLE));
                    String artist = md.getString(MediaMetadata.METADATA_KEY_ARTIST);
                    if (artist == null) artist = md.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST);
                    r.put("artist", artist);
                }
                String pkg = c.getPackageName();
                r.put("pkg", pkg);
                try {
                    PackageManager pm = getContext().getPackageManager();
                    r.put("app", pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString());
                } catch (PackageManager.NameNotFoundException ignored) {
                }
            }
        } catch (SecurityException e) {
            r.put("access", false);
        }
        call.resolve(r);
    }

    @PluginMethod
    public void mediaCommand(PluginCall call) {
        String cmd = call.getString("cmd", "toggle");
        try {
            MediaController c = activeController();
            if (c == null) {
                call.reject("no session");
                return;
            }
            MediaController.TransportControls t = c.getTransportControls();
            switch (cmd) {
                case "next":
                    t.skipToNext();
                    break;
                case "prev":
                    t.skipToPrevious();
                    break;
                default:
                    if (isPlaying(c)) t.pause();
                    else t.play();
            }
            call.resolve();
        } catch (SecurityException e) {
            call.reject("no access");
        }
    }

    @PluginMethod
    public void openMediaAccess(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    // ——— Папка (Melete) ———

    @PluginMethod
    public void pickFolder(PluginCall call) {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, i, "folderPicked");
    }

    @ActivityCallback
    private void folderPicked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
            call.reject("cancelled");
            return;
        }
        Uri tree = data.getData();
        getContext().getContentResolver().takePersistableUriPermission(tree, Intent.FLAG_GRANT_READ_URI_PERMISSION);
        JSObject r = new JSObject();
        r.put("tree", tree.toString());
        call.resolve(r);
    }

    @PluginMethod
    public void readText(PluginCall call) {
        String treeStr = call.getString("tree");
        String path = call.getString("path");
        if (treeStr == null || path == null) {
            call.reject("tree and path required");
            return;
        }
        try {
            Uri tree = Uri.parse(treeStr);
            String docId = DocumentsContract.getTreeDocumentId(tree);
            for (String part : path.split("/")) {
                docId = findChild(tree, docId, part);
                if (docId == null) {
                    call.reject("not found: " + part);
                    return;
                }
            }
            Uri doc = DocumentsContract.buildDocumentUriUsingTree(tree, docId);
            long modified = 0;
            try (Cursor c = getContext().getContentResolver().query(doc, new String[] { DocumentsContract.Document.COLUMN_LAST_MODIFIED }, null, null, null)) {
                if (c != null && c.moveToFirst()) modified = c.getLong(0);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (InputStream in = getContext().getContentResolver().openInputStream(doc)) {
                byte[] buf = new byte[16384];
                int n;
                while (in != null && (n = in.read(buf)) > 0) out.write(buf, 0, n);
            }
            JSObject r = new JSObject();
            r.put("text", new String(out.toByteArray(), StandardCharsets.UTF_8));
            r.put("modified", modified);
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    private String findChild(Uri tree, String parentId, String name) {
        Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, parentId);
        String[] cols = { DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME };
        try (Cursor c = getContext().getContentResolver().query(children, cols, null, null, null)) {
            while (c != null && c.moveToNext()) {
                if (name.equals(c.getString(1))) return c.getString(0);
            }
        }
        return null;
    }
}
