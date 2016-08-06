// This is the data structure that drives the WhatsNew.js control for MGB2

// TODO - support a way to have this on a static site. Concept: http://blog.trello.com/category/new-stuff/ 

// Note on some values:
//    mgbReleaseInfo.releases[].changes[].type
//            feature:      New Feature
//            improvement:  Enhanced existing feature
//            bugfix:       Fix a bug
//            removed:      Feature Removed

// For iteration, I just simply use the number of commits (including this) at https://github.com/devlapse/mgb


export default mgbReleaseInfo = {
  "releases":
  [ 
    {
      "timestamp":     "Fri Aug 05 2016 22:20:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "1025"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.navPanel",
          "type":           "improvement",
          "changeName":     "NavPanel shrink and History panel tweaks",
          "changeSummary":  "The NavPanels have been shrunk a little and the History NavPanel has a much clearer presentation",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.featureLevels",
          "type":           "improvement",
          "changeName":     "Feature Levels icons and hints",
          "changeSummary":  "The 'Feature Levels' icon now looks like sliders. There is now a 'more tools' tool/hint in the toolbars if there are hidden features. The icon text is shown for the most recent feature level increase so it is easy to see what new tools has been enabled per feature-level",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Re-worked Map Editor Toolbar",
          "changeSummary":  "Map Edit tool bar has been re-arranged and has slower progression of tools as Feature Level increases",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.music",
          "type":           "feature",
          "changeName":     "Music Generator (very rough)",
          "changeSummary":  "The first cut of a thematic music generator is now available in Music Editor. It's rough, but you can do some head banging if that's your thing :)",
          "otherUrls":      []
        }
      ]
    },

    {
      "timestamp":     "Tue Aug 02 2016 20:50:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "998"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.edit",
          "type":           "improvement",
          "changeName":     "Improved visuals and hints for Asset-Edit header",
          "changeSummary":  "The Asset Edit header is the area with asset name, #viewers, #changes, project etc. It is common to all the asset editors (graphics, map, sounds etc). It was pretty ugly before, but now looks prettier and isn't so bizarre :)",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.sound",
          "type":           "improvement",
          "changeName":     "Sound timeline improvements",
          "changeSummary":  "Clickable timeline for imported sounds. Thumbnail sound representation now renders all sound instead of part of it",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Tiled (MapEditor.org) map Import guesses images",
          "changeSummary":  "When importing a 'Tiled' map, Map Editor now guesses images from user's Assets",
          "otherUrls":      []
        }
      ]
    },

    {
      "timestamp":     "Tue Aug 02 2016 09:50:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "984"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.sound",
          "type":           "improvement",
          "changeName":     "Select stock sounds",
          "changeSummary":  "There are only three so far, but there will be many soon..",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Graphic Editor Toolbar facelift",
          "changeSummary":  "Improved layout of toolbar, added more UI levels for the slider",
          "otherUrls":      []
        }
      ]
    },



    { 
      "timestamp":     "Sun Jul 31 2016 23:50:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "966"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.users",
          "type":           "improvement",
          "changeName":     "User Lists with Badges",
          "changeSummary":  "The User Lists (find users, project members, users FlexPanel) are prettier and also show badges",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.featureLevels",
          "type":           "feature",
          "changeName":     "Feature Levels",
          "changeSummary":  "The 'Feature Levels' slider has moved to the top of the page. There is also a 'Feature Levels FlexPanel' at the right of the screen that shows all feature levels for the current user",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphics",
          "type":           "improvement",
          "changeName":     "Graphic toolbars now use Feature Levels",
          "changeSummary":  "In Graphic Editor, the tools presented vary based on Feature Level",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.roadmap",
          "type":           "feature",
          "changeName":     "New Roadmap page",
          "changeSummary":  "New Roadmap page - linked from Home NavPanel and from WhatsNew page",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Wed Jul 27 2016 23:50:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "899"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.profile",
          "type":           "improvement",
          "changeName":     "User Profile Page content",
          "changeSummary":  "The User Profile page has been replaced. The new layout includes space for new user information including badges, skills and an activity heatmap. Skills are a placeholder currently, and activty heatmap is not enabled yet",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.layout",
          "type":           "feature",
          "changeName":     "Lightened footer and NotFound page",
          "changeSummary":  "The NotFound(404) page and the Footer area of the Home page are no longer inverted, so they are less visually jarring",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Fri Jul 22 2016 17:30:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "875"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.sound",
          "type":           "feature",
          "changeName":     "Sound Editor - SFX generation",
          "changeSummary":  "The Audio Editor has been replaced by two more specific assets/editors: Sound and Music. Sound editor now allows jsfxr-style sound effects to be re-edited, or for .ogg files to be imported",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.music",
          "type":           "feature",
          "changeName":     "Music Assets",
          "changeSummary":  "The Audio Editor has been replaced by two more specific assets/editors: Sound and Music. Music editor allows .ogg music files to be imported. More features coming soon!",
          "otherUrls":      []
        },

        {
          "featureTag":     "asset.sound",
          "type":           "improvement",
          "changeName":     "Sound Editor - Thumbnails",
          "changeSummary":  "The Sound Editor now saves thumbnails of sounds for Asset previews",
          "otherUrls":      []
        },

        {
          "featureTag":     "asset.music",
          "type":           "improvement",
          "changeName":     "Music Editor - Thumbnails",
          "changeSummary":  "The Music Editor now saves thumbnails of sounds for Asset previews",
          "otherUrls":      []
        },

        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor - fixes and tweaks",
          "changeSummary":  "Map editor is almost functionally complete - so this build has various UI and auto-save tweaks & fixes",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Wed Jul 20 2016 21:25:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "848"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor - auto save",
          "changeSummary":  "The Map Editor is now auto-saving in most cases - there are still some cases to be implemented though",
          "otherUrls":      []
        },

        {
          "featureTag":     "asset.audio",
          "type":           "feature",
          "changeName":     "Audio Editor - audio waveform preview",
          "changeSummary":  "When importing or listing sounds, a waveform is displayed. A cursor shows/sets the current playback position within the sound",
          "otherUrls":      []
        }
      ]
    },
    
    { 
      "timestamp":     "Tue Jul 19 2016 19:31:23 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "837"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor - adaptive toolbar",
          "changeSummary":  "The Map Editor is using the new Editor Toolbar system. This provides more tooltip help, and also supports a 'simplify' mode which shows fewer tools with clearer buttons. Use the slider at the bottom-left of the window to change the Toolbar complexity level",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor - objects",
          "changeSummary":  "The Map Editor supports more object types and object groups",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphics",
          "type":           "improvement",
          "changeName":     "Graphic Editor - nicer resizer",
          "changeSummary":  "You can now enter the width or height of the graphic",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphics",
          "type":           "improvement",
          "changeName":     "Graphic Editor - paste modifiers",
          "changeSummary":  "You can now flip/rotate the paste preview using the mousewheel",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.audio",
          "type":           "feature",
          "changeName":     "Audio Editor - preliminary",
          "changeSummary":  "The Audio asset type has been enabled. So far it can import .ogg files, play them, but not save them (yet)",
          "otherUrls":      []
        }
      ]
    },
    { 
      "timestamp":     "Tue Jul 12 2016 23:40:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "791"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.profile",
          "type":           "improvement",
          "changeName":     "User profile has MGB1 name + avatar",
          "changeSummary":  "MGB1 users can enter their old MGB1 account name and show the icon here. There is no verification of this name (yet)",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphics",
          "type":           "feature",
          "changeName":     "Graphic Import from PNG/GIF",
          "changeSummary":  "Use the IMPORT button to import PNGs/GIFs. PNGs with multiple frames ina 'filmstrip' can be split into individual animation frames at import time. GIFs get imported as multiple frames",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.layout",
          "type":           "improvement",
          "changeName":     "ESC key preserves panel states",
          "changeSummary":  "The ESC key now preserves selected sub-panels for Flex and Nav Panels.. So pushing ESC twice no longer resets to default panels (home+activity)",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Mon Jul 11 2016 23:40:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "779"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.projects.new",
          "type":           "improvement",
          "changeName":     "'Create New Project' is now it's own page",
          "changeSummary":  "The feature to create a new Project was previously a dropdown on the ProjectsList page, but it was cramped, had limited explanation, and was not easily linkable. Moving this to it's own page solves these issues, and gives space to add new features for Projects",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor ellipses",
          "changeSummary":  "Adding more MapEditor.org-compatible features - ellipses (adding functionality)",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Sat Jul 09 2016 13:50:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "761"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.assets.new",
          "type":           "improvement",
          "changeName":     "'Create New Asset' is now a new page",
          "changeSummary":  "The feature to create a new asset was previously a dropdown on the AssetsList page, but it was cramped, had limited explanation, and was not easily linkable. Moving this to it's own page solves these issues, and gives space to add new features such as 'choose project' for asset",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor retangles/polylines",
          "changeSummary":  "Adding more MapEditor.org-compatible features - rectangles and polylines",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Thu Jul 07 2016 21:05:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "735"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.layout",
          "type":           "improvement",
          "changeName":     "Let there be light",
          "changeSummary":  "The FlexPanel (column of stuff on the far right) and the NavBar (bar at top of central section) have been lightened up. Scrollbars also got a similar treatment and visual simplification",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "feature",
          "changeName":     "Graphic area selection now animates",
          "changeSummary":  "Pretty crawling-dashed lines. Unselect and paste-elsewhere coming soon",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Editor tweaks",
          "changeSummary":  "Selections/handles and rotation improvements",
          "otherUrls":      []
        }
      ]
    },
    
    { 
      "timestamp":     "Wed Jul 06 2016 17:35:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "722"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.urls",
          "type":           "improvement",
          "changeName":     "Urls now have username instead of ID",
          "changeSummary":  "The /user/XXXXXXXXXXXXXX urls have been replaced by nicer /u/name urls",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "feature",
          "changeName":     "Cut/Copy/Paste in graphics",
          "changeSummary":  "Select, Copy and Cut work as expected. Paste is going to get more work so it is easy to reposition where to paste to",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "bugfix",
          "changeName":     "3D preview fix for Internet Explorer",
          "changeSummary":  "The 3D map preview now works in Internet Explorer 10",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Tue Jul 05 2016 22:20:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "705"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.flexpanel.chat",
          "type":           "improvement",
          "changeName":     "Chat can load earlier messages",
          "changeSummary":  "Chat only loads 5 most recent messages initially, and user can load more history as desired",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.chat",
          "type":           "improvement",
          "changeName":     "Chat channels are on the url",
          "changeSummary":  "Chat channels are now part of the url (e.g ?_fp=chat.random) so back/fwd navigation and deep links work correctly",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.layout",
          "type":           "improvement",
          "changeName":     "Home page and scrollbar cleanup",
          "changeSummary":  "Added webkit-specific styling options to shrink the scrollbars on Windows for Webkit-based browsers (notably Google Chrome). Shrunk the Home page masthead and changed it's colorscheme to black-on-white.",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "bugfix",
          "changeName":     "Map grid bugfix",
          "changeSummary":  "The visual and log errors from moving maps when grid=off have been fixed",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.chat",
          "type":           "improvement",
          "changeName":     "Chat channels",
          "changeSummary":  "Chat now has multiple channels.. with security!",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel",
          "type":           "improvement",
          "changeName":     "FlexPanel Select/hide column",
          "changeSummary":  "FlexPanel is now a mini menu column on the right of the window. This provides much faster navigation and will also enable notification for chat etc",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.assets",
          "type":           "bugfix",
          "changeName":     "Asset List sort-by selections fixed",
          "changeSummary":  "The sort-by selections for Assets were only being applied locally. The server now honors the same orderings so the list makes sense now",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "bugfix",
          "changeName":     "Fixed graphic frame select issues.",
          "changeSummary":  "The edit area now reliably matches the selected frame/layer, even after inserts, moves etc",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "bugfix",
          "changeName":     "Play-animation no longer spams database",
          "changeSummary":  "Changing frame/layer can only update the viewer/activity database every five seconds now.. Not everytime the animation frame changes!",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Graphic Pen/Erase tools more responsive",
          "changeSummary":  "The Pen and Edit tools no longer leave gaps when mouse movement is rapid",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Support for maps from MGBv1",
          "changeSummary":  "The import capabilities aren't exposed for users yet, but you can see some MGB1 maps starting to appear :)",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.doc",
          "type":           "improvement",
          "changeName":     "Experimenting with a document edit control",
          "changeSummary":  "Documents can't yet be saved.",
          "otherUrls":      []
        }
      ]
    },

    
    { 
      "timestamp":     "Fri Jun 24 2016 21:00:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "639"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Graphic editor fixes and improvements",
          "changeSummary":  "Undo now works after adding layers/frames. Hover help on preview frames. Warnings and info on tools and read-only cases. Hover help for tools. Optimized backwash for just relevant cases",
          "otherUrls":      []
        },
        {
          "featureTag":     "api.mgb1",
          "type":           "feature",
          "changeName":     "Api for MGBv1 assets",
          "changeSummary":  "New REST API for obtaining MGBv1 tiles as PNGs, and actor/map assets as JSON data. For example http://v2.mygamebuilder.com/api/mgb1/map/.acey53/Club%20Penguin%20Agents%20Under%20Attack/HQ",
          "otherUrls":      []
        }
      ]
    },


    { 
      "timestamp":     "Mon Jun 20 2016 01:10:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "620"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Graphic editor fixes for fill and pen",
          "changeSummary":  "Fill was only filling if colors were significantly different. Tolerance has been reduced from 128 to 8. Also fixed single-click pen bug - this now renders 1 pixel change. Edits were sometimes lost with drawing after save - now fixed",
          "otherUrls":      []
        },
        {
          "featureTag":     "assets",
          "type":           "improvement",
          "changeName":     "Assets have a description field",
          "changeSummary":  "Asset descriptions can be edited in the Asset Editor using the header. If there is no description and you do not have write access, then the description is not shown",
          "otherUrls":      []
        },
        {
          "featureTag":     "user.profile.focus",
          "type":           "feature",
          "changeName":     "Focus Message in Profile and Nav",
          "changeSummary":  "On your profile, there is now a 'Focus' field. If set, this shows in your top Nav bar. Changes are also logged in the activity tracker. It is intended to help you remember and communicate your current focus.",
          "otherUrls":      []
        },
        {
          "featureTag":     "ops.scale",
          "type":           "improvement",
          "changeName":     "MGBv2 server farm",
          "changeSummary":  "The servers have been scaled up. There are three front-end server nodes plus three back-end MongoDB Database replica nodes. In addition, load profiling/alerting have been enabled for the servers.",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.navbar",
          "type":           "improvement",
          "changeName":     "Breadcrumb bar on Nav Bar (top row)",
          "changeSummary":  "All pages now show a navigation context on the Navigation bar. The smaller assetEdit breadcrumb bar has shrunk to remove duplicate content",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Raise/Lower Map Layer",
          "changeSummary":  "More tools and fixes for maps",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Undo/Redo for maps",
          "changeSummary":  "Undo and Redo for maps.",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel",
          "type":           "improvement",
          "changeName":     "FlexPanels are browser height",
          "changeSummary":  "FlexPanels on the right are now fixed in place and don't scroll with page",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.assets",
          "type":           "improvement",
          "changeName":     "Asset card avatars and links",
          "changeSummary":  "Asset cards now show User avatars. Asset cards are also now clickable to edit/view using the thumbnail or title",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.navpanel",
          "type":           "improvement",
          "changeName":     "NavPanels are browser height",
          "changeSummary":  "NavPanels on the left are now fixed in place and don't scroll with page",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.chat",
          "type":           "improvement",
          "changeName":     "Chat autoscrolls to end",
          "changeSummary":  "The Chat FlexPanel now autoscrolls to most recent message. No way to prevent this yet",
          "otherUrls":      []
        }
      ]
    },


    { 
      "timestamp":     "Thu Jun 16 2016 03:05:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "552"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Tile Layer Tools",
          "changeSummary":  "More tools and fixes for maps",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.activity",
          "type":           "improvement",
          "changeName":     "Activity Flexpanel more compact, has user images",
          "changeSummary":  "Shrunk fonts/sizes and tightened text for activity feed. Added user images!",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.chat",
          "type":           "improvement",
          "changeName":     "Chat Flexpanel has user images",
          "changeSummary":  "Added user images to Chat Flexpanel and fixed bug with empty messages and scrolling",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Graphic animation improvements",
          "changeSummary":  "In graphic editor, it is easier now to manage animations. Also, shrunk tools slightly",
          "otherUrls":      []
        }
      ]
    },


    { 
      "timestamp":     "Wed Jun 15 2016 02:01:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "524"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.assetedit",
          "type":           "improvement",
          "changeName":     "Navigation Breadcrumb bar",
          "changeSummary":  "Improved the left-half of the Asset Edit header. The breadcrumb bar now provides more context and also easy navigation to related material",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.chat",
          "type":           "feature",
          "changeName":     "Chat!",
          "changeSummary":  "Only global chat for now. Channels and DMs are coming soon. Use the Chat FlexPanel on the right to see and send chat messages",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.esc",
          "type":           "feature",
          "changeName":     "ESC key toggles Panels",
          "changeSummary":  "Press ESC to show/hide both sets of Panels",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.navpanel.recent",
          "type":           "improvement",
          "changeName":     "History - Ranges and Actions",
          "changeSummary":  "Improved the NavPanel recent/history panel. It now shows history broken into three age ranges, and provides more feedback on what changed",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Delete ops",
          "changeSummary":  "Delete frame / layer is more robust now",
          "otherUrls":      []
        }
      ]
    },

    { 
      "timestamp":     "Mon Jun 13 2016 23:45:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "499"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.navpanel.project",
          "type":           "feature",
          "changeName":     "NavPanel for Projects",
          "changeSummary":  "Extra NavPanel showing Owned and Member-of projects",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Frame ops",
          "changeSummary":  "Extra operations for frames - delete, move, insert",
          "otherUrls":      []
        }
      ]
    },


    { 
      "timestamp":     "Wed Jun 08 2016 21:10:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "456"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.map",
          "type":           "improvement",
          "changeName":     "Map Grids, Layers, fixes",
          "changeSummary":  "Grids for each layer, Active Layer Highlight, other fixes",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Graphic Animations",
          "changeSummary":  "Graphic Animations, also layer/frame features work now",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.navpanel.recent",
          "type":           "improvement",
          "changeName":     "Recent asset thumbnails",
          "changeSummary":  "Show thumbnail previews for Recent assets on hover",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.activity",
          "type":           "improvement",
          "changeName":     "Active asset thumbnails",
          "changeSummary":  "Show thumbnail previews for Active assets on hover",
          "otherUrls":      []
        }
      ]             
    },                    
    

    { 
      "timestamp":     "Tue Jun 07 2016 14:16:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "410"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.links",
          "type":           "improvement",
          "changeName":     "Nav Panel Framework",
          "changeSummary":  "All  Links are now preserving the panel states.",
          "otherUrls":      []
        },
        {
          "featureTag":     "asset.graphic",
          "type":           "improvement",
          "changeName":     "Show/Lock/Preview frame/layer",
          "changeSummary":  "Show/Hide/Lock/Unlock layer (buttons, not working yet), show preview canvas, add frame",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.sidebar",
          "type":           "removed",
          "changeName":     "Sidebar removed",
          "changeSummary":  "This has been replaced by the nav panel which can persist and provide a two-level navigation",
          "otherUrls":      []
        }
      ]             
    },                    
       
    
    { 
      "timestamp":     "Tue Jun 07 2016 01:00:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "387"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.navpanel",
          "type":           "feature",
          "changeName":     "Nav Panel Framework",
          "changeSummary":  "Added the new Nav Panel framework. This is on the left. There is a permanent 1st level nav which unlocks 2nd level nav that can be hidden/shown by clicking on the 1st level nav icon. Needs tidying up, but this is the intent for replaceing the sidebar and top nav",
          "otherUrls":      []
        }
      ]             
    },                    
       
    
    { 
      "timestamp":     "Sun Jun 05 2016 13:45:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "376"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.flexpanel.assets",
          "type":           "feature",
          "changeName":     "Assets Flex Panel",
          "changeSummary":  "Added the 'Assets' Flex Panel including name search. Use the > button in the top-right NavBar to show this",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.USERS",
          "type":           "feature",
          "changeName":     "USER Flex Panel",
          "changeSummary":  "Added a simplistic (for now) 'Users' Flex panel. Use the > button in the top-right NavBar to show this",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.flexpanel.activity",
          "type":           "feature",
          "changeName":     "Activity Flex Panel",
          "changeSummary":  "Added the 'Activity' Flex panel. Use the > button in the top-right NavBar to show this",
          "otherUrls":      []
        },
        {
          "featureTag":     "assets.map",
          "type":           "improvement",
          "changeName":     "Map editor",
          "changeSummary":  "Temporary way to add tilemaps by pasting in an MGB Asset URL",
          "otherUrls":      []
        }
      ]             
    },                    


    { 
      "timestamp":     "Thu Jun 02 2016 23:45:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "355"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.flexpanel",
          "type":           "feature",
          "changeName":     "FlexPanels",
          "changeSummary":  "Added the UI framework for Flex Panels - space for extra context on the RHS of the screen, similar to slack",
          "otherUrls":      []
        }
              
      ]             
    },            
    

    { 
      "timestamp":     "Thu Jun 02 2016 10:35:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "354"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "assets.map",
          "type":           "feature",
          "changeName":     "Map editor",
          "changeSummary":  "First parts of Map editor in place - import, render and show tileMaps",
          "otherUrls":      []
        },
        {
          "featureTag":     "assets.graphics",
          "type":           "bugfix",
          "changeName":     "Tool selection fixed",
          "changeSummary":  "Fixed problems where tool selection was inconsistent",
          "otherUrls":      []
        }
              
      ]             
    },    
        
    { 
      "timestamp":     "Mon May 30 2016 23:25:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "345"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.assets",
          "type":           "improvement",
          "changeName":     "Asset card cleanup",
          "changeSummary":  "Asset cards are now fixed width and have more space for the thumbnails. Some other visual cleanup also. Asset kind selector has an explicit All selector, and alt-click behavior has been reversed",
          "otherUrls":      []
        },
        {
          "featureTag":     "assets.code",
          "type":           "improvement",
          "changeName":     "Code Thumbnails",
          "changeSummary":  "Code can now have thumbnails. Use the Set Thumbnail button while the script is running",
          "otherUrls":      []
        }
              
      ]             
    },
    
    
    { 
      "timestamp":     "Mon May 30 2016 02:00:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "338"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "projects",
          "type":           "improvement",
          "changeName":     "Project Cards Descriptions",
          "changeSummary":  "Project Card Overview page allows Project description to be edited",
          "otherUrls":      []
        }
        
      ]             
    },
    
    
    { 
      "timestamp":     "Sun May 29 2016 14:00:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "337"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "projects",
          "type":           "improvement",
          "changeName":     "Project Cards, Membership",
          "changeSummary":  "Fuller implementation of projects with membership, project cards etc",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.assets",
          "type":           "improvement",
          "changeName":     "Asset queries bookmarkable",
          "changeSummary":  "Asset queries now put the query state on the URL so it can support bookmarking and deep linking",
          "otherUrls":      []
        },
        {
          "featureTag":     "ui",
          "type":           "improvement",
          "changeName":     "Lots of UI tweaks everywhere",
          "changeSummary":  "Spacing, alignment and control changes in many places ",
          "otherUrls":      []
        }
      ]             
    },
    

    { 
      "timestamp":     "Tue May 24 2016 20:50:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "317"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "assets.kind._mgbui",
          "type":           "improvement",
          "changeName":     "MGB UI Mockup asset",
          "changeSummary":  "Multi-user editing now works with this asset type. Also tweaked 'Strip react comments' icon",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.whatsnew",
          "type":           "improvement",
          "changeName":     "Yellow for What's New",
          "changeSummary":  "Trying a yellow background to make this stand out from the rest of the site.. since it is meta ",
          "otherUrls":      []
        }
      ]             
    },
    

    { 
      "timestamp":     "Mon May 23 2016 18:20:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "316"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "assets.kind._mgbui",
          "type":           "feature",
          "changeName":     "MGB UI Mockup asset",
          "changeSummary":  "New MGBUI asset kind (for MGB devs only) to edit/preview our SemanticUi markup. Including HTML smart editor and Semantic UI hints for icons and elements",
          "otherUrls":      []
        }
      ]             
    },
    

    { 
      "timestamp":     "Sat May 21 2016 19:45:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "314"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.assets",
          "type":           "improvement",
          "changeName":     "Asset Filters column",
          "changeSummary":  "Filters column is fixed size and white now",
          "otherUrls":      []
        }        
      ]             
    },
    

    { 
      "timestamp":     "Fri May 20 2016 23:45:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "313"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "user.profile.text",
          "type":           "improvement",
          "changeName":     "User Profile text",
          "changeSummary":  "User Profile text can now be edited and saved",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.assets",
          "type":           "improvement",
          "changeName":     "Asset Filters column",
          "changeSummary":  "Moved the search selectors to a left column.",
          "otherUrls":      []
        }        
      ]             
    },
    
    { 
      "timestamp":     "Wed May 18 2016 21:30:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "312"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.edit.history",
          "type":           "improvement",
          "changeName":     "Asset History renamed",
          "changeSummary":  "Asset History is now 'Changes' and has a lightning icon. Layout was also slightly changed",
          "otherUrls":      []
        },        
        {
          "featureTag":     "nav.assets.create",
          "type":           "improvement",
          "changeName":     "Audio & Cutscene icons",
          "changeSummary":  "Audio & Cutscene asset types now have more relevant icons",
          "otherUrls":      []
        }
      ]             
    },


    { 
      "timestamp":     "Wed May 18 2016 16:30:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "311"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "nav.whatsnew",
          "type":           "feature",
          "changeName":     "'What's New!'",
          "changeSummary":  "New icon & popup on header describes new features of MGB - like this!",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.assets.create",
          "type":           "improvement",
          "changeName":     "Create Asset",
          "changeSummary":  "Asset types that are not implemented yet are now greyed out",
          "otherUrls":      []
        }        
      ]             
    },


    { 
      "timestamp":     "Mon May 16 2016 22:30:00 GMT-0700 (PDT)",
      
      "id": {
        "ver":         "0.0.1",
        "state":       "alpha",
        "iteration":   "310"
      },

      "releaseManagement": {
        "eng":         "dgolds"
      },
      
      "changes": [
        {
          "featureTag":     "asset.edit.history",
          "type":           "feature",
          "changeName":     "View Asset history",
          "changeSummary":  "In Asset Editor, show history of changes to this asset",
          "otherUrls":      []
        },
        {
          "featureTag":     "nav.assets.search",
          "type":           "bugfix",
          "changeName":     "Text search fixed",
          "changeSummary":  "Text search was only doing full word search. Now handles partial string matches",
          "otherUrls":      []
        }        
      ]             
    }
    
  ]
}