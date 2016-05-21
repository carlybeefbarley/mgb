
// This is the data structure that drives the WhatsNew.js control for MGB2

// TODO - support a way to have this on a static site. Concept: http://blog.trello.com/category/new-stuff/ 

// Note on some values:
//    mgbReleaseInfo.releases[].changes[].type
//            feature:      New Feature
//            improvement:  Enhanced existing feature
//            bugfix:       Fix a bug


export default mgbReleaseInfo = {
  "releases":
  [
    
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
          "changeName":     "Filtering column",
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