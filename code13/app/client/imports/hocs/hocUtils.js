// Utilities for HOCs

export const getDisplayName = WrappedComponent => {
  return typeof WrappedComponent === 'string'
    ? WrappedComponent
    : WrappedComponent.displayName || WrappedComponent.name || 'Anonymous'
}
