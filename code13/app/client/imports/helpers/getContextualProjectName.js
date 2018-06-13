import _ from 'lodash'

const getContextualProjectName = ({ location, currentlyEditingAssetInfo, params }) => {
  const { query } = location
  const { projectNames } = currentlyEditingAssetInfo

  // Else is it a query?
  return _.first(projectNames) || _.get(query, 'project') || params.projectName
}

export default getContextualProjectName
