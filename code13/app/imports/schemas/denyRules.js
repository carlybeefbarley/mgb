// This file sets up the Allow/Deny rules as advised at http://guide.meteor.com/security.html#allow-deny
//
// Basically - deny the client, and only use Methods.


import { Users, Azzets, Projects, Activity, ActivitySnapshots, Chats } from '../schemas';

Azzets.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Projects.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Activity.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

ActivitySnapshots.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Chats.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});