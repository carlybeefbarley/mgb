app/imports/*

This app/imports/ folder contains javascript source code files that will be needed
on both the client and the server. A good example is the schemas/ folder that defines
the data records to be kept in sync between clients and servers.

Files in or below app/imports/ are _not_ auto-loaded by the meteor build process.
Instead, they must be explicitly imported by some files under /client or /server in
order to be incorprated into the node server code or the client bundle.

