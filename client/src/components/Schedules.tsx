import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createSchedule, deleteSchedule, getSchedules, patchSchedule } from '../api/schedules-api'
import Auth from '../auth/Auth'
import { Schedule } from '../types/Schedule'
import '../App.css'

interface SchedulesProps {
  auth: Auth
  history: History
}

interface SchedulesState {
  schedules: Schedule[]
  newScheduleName: string
  loadingSchedules: boolean
}

export class Schedules extends React.PureComponent<SchedulesProps, SchedulesState> {
  state: SchedulesState = {
    schedules: [],
    newScheduleName: '',
    loadingSchedules: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newScheduleName: event.target.value })
  }

  onEditButtonClick = (scheduleId: string) => {
    this.props.history.push(`/schedules/${scheduleId}/edit`)
  }

  onScheduleCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newSchedule = await createSchedule(this.props.auth.getIdToken(), {
        name: this.state.newScheduleName,
        dueDate
      })
      this.setState({
        schedules: [...this.state.schedules, newSchedule],
        newScheduleName: ''
      })
    } catch {
      alert('Schedule creation failed')
    }
  }

  onScheduleDelete = async (scheduleId: string) => {
    try {
      await deleteSchedule(this.props.auth.getIdToken(), scheduleId)
      this.setState({
        schedules: this.state.schedules.filter(schedule => schedule.scheduleId != scheduleId)
      })
    } catch {
      alert('Schedule deletion failed')
    }
  }

  onScheduleCheck = async (pos: number) => {
    try {
      const schedule = this.state.schedules[pos]
      await patchSchedule(this.props.auth.getIdToken(), schedule.scheduleId, {
        name: schedule.name,
        dueDate: schedule.dueDate,
        done: !schedule.done
      })
      this.setState({
        schedules: update(this.state.schedules, {
          [pos]: { done: { $set: !schedule.done } }
        })
      })
    } catch {
      alert('Schedule deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const schedules = await getSchedules(this.props.auth.getIdToken())
      this.setState({
        schedules,
        loadingSchedules: false
      })
    } catch (e) {
      alert(`Failed to fetch schedules: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1" className="intro">Here is what is on your Schedule</Header>

        {this.renderCreateScheduleInput()}

        {this.renderSchedules()}
      </div>
    )
  }

  renderCreateScheduleInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add new',
              onClick: this.onScheduleCreate
            }}
            fluid
            actionPosition="left"
            placeholder="schedule something new..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderSchedules() {
    if (this.state.loadingSchedules) {
      return this.renderLoading()
    }

    return this.renderSchedulesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading SCHEDULEs
        </Loader>
      </Grid.Row>
    )
  }

  renderSchedulesList() {
    return (
      <Grid padded>
        {this.state.schedules.map((schedule, pos) => {
          return (
            <Grid.Row key={schedule.scheduleId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onScheduleCheck(pos)}
                  checked={schedule.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {schedule.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {schedule.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(schedule.scheduleId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onScheduleDelete(schedule.scheduleId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {schedule.attachmentUrl && (
                <Image src={schedule.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
