class UpcomingClassAssignmentsList extends React.Component {
    render() {
      return (
        <List>
          <List.Item key="id">
            <List.Icon name="student" />
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'lightgray' }}>when</small>
              </List.Content>
              <List.Header>Foo bar</List.Header>
              <List.Description>
                <small>Carly is cool</small>
              </List.Description>
            </List.Content>
          </List.Item>
          <List.Item key="id2">
            <List.Icon name="code" />
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'lightgray' }}>when</small>
              </List.Content>
              <List.Header>Your Mom</List.Header>
              <List.Description>
                <small>goes to college</small>
              </List.Description>
            </List.Content>
          </List.Item>
          <List.Item key="id3">
            <List.Icon name="clock" />
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'lightgray' }}>when</small>
              </List.Content>
              <List.Header>Llama Llama</List.Header>
              <List.Description>
                <small>red pajamas</small>
              </List.Description>
            </List.Content>
          </List.Item>
          <List.Item key="id4">
            <List.Icon name="keyboard" />
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'lightgray' }}>when</small>
              </List.Content>
              <List.Header>Bread Jedi</List.Header>
              <List.Description>
                <small>flexible bean</small>
              </List.Description>
            </List.Content>
          </List.Item>
          <List.Item key="id5">
            <List.Icon name="smile" />
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'lightgray' }}>when</small>
              </List.Content>
              <List.Header>See ya See ya</List.Header>
              <List.Description>
                <small>wouldn't wanna be ya</small>
              </List.Description>
            </List.Content>
          </List.Item>
          <List.Item key="id6">
            <List.Icon name="female" />
            <List.Content style={{ width: '100%' }}>
              <List.Content floated="right">
                <small style={{ color: 'lightgray' }}>when</small>
              </List.Content>
              <List.Header>Girls Rule</List.Header>
              <List.Description>
                <small>boys drool</small>
              </List.Description>
            </List.Content>
          </List.Item>
        </List>
      )
    }
  }