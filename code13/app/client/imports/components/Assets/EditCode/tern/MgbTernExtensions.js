//
// This file contains our extensions to TERN that allow the MGB editor to do
// more sophisticated explanations of code as the user edits or moves their cursor around
//
//
// This should be invoked once to extend TERN once TERN has been initialized.
//
// Documentation on TERN plugins is at http://ternjs.net/doc/manual.html#plugins
// For an example of such an extension, see https://github.com/angelozerr/tern-outline/blob/master/outline.js
//

import { isIdentifierChar } from 'acorn/dist/acorn.js'
import infer from 'tern/lib/infer.js'

// Copied from tern/lib/tern.js since it was simple and not exported
// TODO - can I get these from tern object?
function ternError(msg) {
  var err = new Error(msg)
  err.name = 'TernError'
  return err
}

// Copied from tern/lib/tern.js since it was simple and not exported
// TODO - can I get these from tern object?
function isStringAround(node, start, end) {
  return (
    node.type == 'Literal' && typeof node.value == 'string' && node.start == start - 1 && node.end <= end + 1
  )
}

// Copied from tern/lib/tern.js since it was simple and not exported
// TODO - can I get these from tern object?
function pointInProp(objNode, point) {
  for (let i = 0; i < objNode.properties.length; i++) {
    var curProp = objNode.properties[i]
    if (curProp.key.start <= point && curProp.key.end >= point) return curProp
  }
}

/**
 * @params  tern  The TERN global to be extended
 */
export default function InstallMgbTernExtensions(tern) {
  tern.registerPlugin('mgbTernPlugins', function(server, options) {
    // No extra work required
  })

  tern.defineQueryType('mgbGetMemberParent', {
    takesFile: true,
    run(srv, query, file) {
      try {
        return DG_MEMBERPARENT(tern, srv, query, file)
      } catch (err) {
        console.error(err.stack)
        return { outline: [] }
      }
    },
  })
}

function DG_MEMBERPARENT(tern, srv, query, file) {
  if (query.end == null) throw ternError('missing .query.end field')
  var fromPlugin = srv.signalReturnFirst('completion', file, query)
  if (fromPlugin) return fromPlugin

  var wordStart = tern.resolvePos(file, query.end),
    wordEnd = wordStart,
    text = file.text
  while (wordStart && isIdentifierChar(text.charCodeAt(wordStart - 1))) --wordStart
  if (query.expandWordForward !== false)
    while (wordEnd < text.length && isIdentifierChar(text.charCodeAt(wordEnd))) ++wordEnd
  var word = text.slice(wordStart, wordEnd),
    ignoreObj
  if (query.caseInsensitive) word = word.toLowerCase()

  var prop, objType, isKey

  var exprAt = infer.findExpressionAround(file.ast, null, wordStart, file.scope)
  var memberExpr, objLit
  // Decide whether this is an object property, either in a member
  // expression or an object literal.
  if (exprAt) {
    var exprNode = exprAt.node
    if (exprNode.type == 'MemberExpression' && exprNode.object.end < wordStart) {
      memberExpr = exprAt
    } else if (isStringAround(exprNode, wordStart, wordEnd)) {
      var parent = infer.parentNode(exprNode, file.ast)
      if (parent.type == 'MemberExpression' && parent.property == exprNode)
        memberExpr = { node: parent, state: exprAt.state }
    } else if (exprNode.type == 'ObjectExpression') {
      var objProp = pointInProp(exprNode, wordEnd)
      if (objProp) {
        objLit = exprAt
        prop = isKey = objProp.key.name
      } else if (!word && !/:\s*$/.test(file.text.slice(0, wordStart))) {
        objLit = exprAt
        prop = isKey = true
      }
    }
  }

  if (objLit) {
    // Since we can't use the type of the literal itself to complete
    // its properties (it doesn't contain the information we need),
    // we have to try asking the surrounding expression for type info.
    objType = infer.typeFromContext(file.ast, objLit)
  } else if (memberExpr) {
    prop = memberExpr.node.property
    prop = prop.type == 'Literal' ? prop.value.slice(1) : prop.name
    memberExpr.node = memberExpr.node.object
    objType = infer.expressionType(memberExpr)
  } else if (text.charAt(wordStart - 1) == '.') {
    var pathStart = wordStart - 1
    while (
      pathStart &&
      (text.charAt(pathStart - 1) == '.' || isIdentifierChar(text.charCodeAt(pathStart - 1)))
    )
      pathStart--
    var path = text.slice(pathStart, wordStart - 1)
    if (path) {
      objType = infer.def.parsePath(path, file.scope).getObjType()
      prop = word
    }
  }

  return {
    start: tern.outputPos(query, file, wordStart),
    end: tern.outputPos(query, file, wordEnd),
    isProperty: !!prop,
    isObjectKey: !!isKey,
    objType,
  }
}
