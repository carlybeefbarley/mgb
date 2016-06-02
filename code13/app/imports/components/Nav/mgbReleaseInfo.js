// This is the data structure that drives the WhatsNew.js control for MGB2

// TODO - support a way to have this on a static site. Concept: http://blog.trello.com/category/new-stuff/ 

// Note on some values:
//    mgbReleaseInfo.releases[].changes[].type
//            feature:      New Feature
//            improvement:  Enhanced existing feature
//            bugfix:       Fix a bug

// For iteration, I just simply use the number of commits (including this) at https://github.com/devlapse/mgb


export default mgbReleaseInfo = {
  "releases":
  [
        
    
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