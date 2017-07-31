import React from 'react'
import * as enzyme from 'enzyme'

import EditorToolItem from '../EditorToolItem'
import { Icon } from 'semantic-ui-react'

describe('EditorToolItem', () => {
  test('Renders an icon and label by default', () => {
    const wrapper = enzyme.mount(<EditorToolItem icon="pencil" content="Pencil" />)

    expect(wrapper).toContainReact(<Icon className="pencil" size="large" />)
    expect(wrapper).toIncludeText('Pencil')
  })

  describe('iconOnly', () => {
    test('Hides the label', () => {
      const wrapper = enzyme.mount(<EditorToolItem iconOnly icon="pencil" content="Pencil" />)

      expect(wrapper).toContainReact(<Icon className="pencil" size="large" />)
      expect(wrapper).not.toIncludeText('Pencil')
    })
  })
})
