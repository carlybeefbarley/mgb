# /client/components/authenticated

These are components that can only be used by authenticated users


These are typically data-binding-driven React .jsx files that define a component and reference components in order to make the overall user experience

An example of a top-most component that binds to a Meteor collection is in dashboard.jsx. This in turn uses people-table.jsx and then person.jsx, passing down the data references to each nested component.
