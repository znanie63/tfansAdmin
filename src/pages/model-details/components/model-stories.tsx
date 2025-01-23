@@ .. @@
-  const getTimeLeft = (expiresAt: Date) => {
-    const diff = new Date(expiresAt).getTime() - Date.now();
-    const hours = Math.floor(diff / (1000 * 60 * 60));
-    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
-    return `${hours}h ${minutes}m`;
+  const getTimeAgo = (createdAt: Date) => {
+    const diff = Date.now() - new Date(createdAt).getTime();
+    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
+    if (days === 0) return 'Today';
+    if (days === 1) return 'Yesterday';
+    return `${days} days ago`;
   };
@@ .. @@
                   <div className="space-y-2">
                     <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
-                      Active
+                      Posted
                     </Badge>
                     <div className="flex items-center justify-between">
                       <p className="text-xs text-muted-foreground">
-                        Expires in {getTimeLeft(story.expiresAt)}
+                        {getTimeAgo(story.createdAt)}
                       </p>