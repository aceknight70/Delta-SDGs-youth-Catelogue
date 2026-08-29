sed -i '/<div id="root"><\/div>/i \
    <script>\
      window.addEventListener("error", function(e) {\
        console.error("GLOBAL ERROR:", e.error);\
        document.body.innerHTML += "<div style=\\"color:red;padding:20px;background:white;z-index:9999;position:fixed;top:0;left:0;\\">" + e.error.message + "<br>" + e.error.stack + "</div>";\
      });\
    </script>' index.html
