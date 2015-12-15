# /client/components/globals

These 'globals' are sometimes-public (aka sometimes-unauthenticated) React components - for example the navigation, headers, footers, 404 page etc

These are typically simple React .jsx files that define a component and don't reference any other modules of code. 

* A special one to note is header.jsx that then includes either authenticated-navigation.jsx OR public-navigation.jsx depending on the login state of the user
* Another special one is *not-found.jsx* which is the '404' page.
* Another special one is *loading.jsx* which is the 'loading' spinner

