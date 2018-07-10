import React, { Component } from 'react'
import Switch from './Switch'

const LoopController = props => {
  const inputProps = {
    id: 'loop',
    label: 'Loop',
    isActive: props.isLooping,
    onChange: () => props.actions.updateIsLooping(!props.isLooping),
  }

  return <Switch {...inputProps} />
}

export default LoopController
