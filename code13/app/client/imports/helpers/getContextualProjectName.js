import _ from 'lodash'

const getContextualProjectName = ({ location, currentlyEditingAssetInfo, params }) => {
  const { query } = location
  const { projectNames } = currentlyEditingAssetInfo

  // Else is it a query?
  return _.get(query, 'project') || _.first(projectNames) || params.projectName
}

export default getContextualProjectName
