import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Divider, Form, Grid, Header } from 'semantic-ui-react'

import { fetchTask } from '../actions/tasks'
import { getTask } from '../reducers/tasks'
import { createPullRequest } from '../actions/pullRequests'

import Head from '../components/common/Head'
import Layout from '../components/Layout'
import Tags from '../components/common/Tags'


class SubmitWork extends Component {
  constructor(props) {
    super(props)
    this.state = {
      id: '',
      url: ''
    }
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentWillMount() {
    // const {
    //   fetchTask, match: {
    //     params: { id }
    //   }
    // } = this.props
    // fetchTask(id)
  }

  onChangeId = ({ target: { value } }) => {
    this.setState({ id: value }, () => {
      this.props.fetchTask(value)
    })
  }

  onChangeURL = ({ target: { value } }) => {
    //  TODO url validation
    this.setState({ url: value })
  }

  onSubmit = async (e) => {
    e.preventDefault()
    const { id, url } = this.state
    this.props.createPullRequest({ id, url })
  }

  render() {
    const { task } = this.props
    const { id, url } = this.state

    return (
      <Layout>
        <Head title='Task'/>
        <div className='task'>
          <Grid.Row columns={1}>
            <Form onSubmit={this.onSubmit}>
              <Header as='h1'>Submit Task</Header>
              <Form.Field required>
                <input
                  type='text'
                  placeholder='Task ID '
                  onChange={this.onChangeId}
                  name='id'
                  value={id}
                />
              </Form.Field>
              <Form.Field required>
                <input
                  type='text'
                  placeholder='URL to commit or pull request'
                  onChange={this.onChangeURL}
                  name='url'
                  value={url}
                />
              </Form.Field>
              <Button
                size='large'
                color='green'
                type='submit'
              >
                Submit
              </Button>
            </Form>
          </Grid.Row>
          {task && (
            // so submitter can know they're submitting for the right task
            <div>
              <Divider section />
              <Header as='h2'>{task.title}</Header>
              <Header as='h3'>{task._id}</Header>
              <Tags task={task}/>
            </div>
          )}
        </div>
      </Layout>
    )
  }
}

const mapStateToProps = (state) => ({
  task: getTask(state)
})

const mapDispatchToProps = dispatch => ({
  fetchTask: id => dispatch(fetchTask(id)),
  createPullRequest: taskId => dispatch(createPullRequest(taskId))
})

export default connect(mapStateToProps, mapDispatchToProps)(SubmitWork)