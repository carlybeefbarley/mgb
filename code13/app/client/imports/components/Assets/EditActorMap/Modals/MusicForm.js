import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'

export default class ModalForm extends BaseForm {
  get data(){
    return this.props.asset
  }
  render(){
    return(
      <div>
        {this.dropArea("Music", "music", "music")}
      </div>
    )
  }
}
