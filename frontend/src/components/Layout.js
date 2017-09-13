import React from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Divider,
  Menu,
  Segment,
} from 'semantic-ui-react'

export default ({ children, title }) => (
  <div>
    <Menu fixed='top' inverted>
      <Container>
        <Menu.Item as={Link} to='/' header>Distense</Menu.Item>
        <Menu.Menu position='right'>
          <Menu.Item as={Link} to='/tasks'>View Tasks</Menu.Item>
          <Menu.Item as={Link} to='/tasks/create'>Create Task</Menu.Item>
          <Menu.Item as={Link} to='/pullrequests/create'>Submit Work</Menu.Item>
          <Menu.Item as={Link} to='/pullrequests'>Review Work</Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>

    <Container style={{ marginTop: '6em' }}>
      {children}
    </Container>

    <Segment
      vertical
      style={{ margin: '3em 0em 0em', padding: '5em 0em' }}
    >
      <Container>
        <Divider/>
        © {new Date().getFullYear()} Distense
      </Container>
    </Segment>
  </div>
)