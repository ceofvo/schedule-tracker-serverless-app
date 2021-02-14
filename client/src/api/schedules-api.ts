import { apiEndpoint } from '../config'
import { Schedule } from '../types/Schedule';
import { CreateScheduleRequest } from '../types/CreateScheduleRequest';
import Axios from 'axios'
import { UpdateScheduleRequest } from '../types/UpdateScheduleRequest';

export async function getSchedules(idToken: string): Promise<Schedule[]> {
  console.log('Fetching schedules')

  const response = await Axios.get(`${apiEndpoint}/schedules`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Schedules:', response.data)
  return response.data.items
}

export async function createSchedule(
  idToken: string,
  newSchedule: CreateScheduleRequest
): Promise<Schedule> {
  const response = await Axios.post(`${apiEndpoint}/schedules`,  JSON.stringify(newSchedule), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchSchedule(
  idToken: string,
  scheduleId: string,
  updatedSchedule: UpdateScheduleRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/schedules/${scheduleId}`, JSON.stringify(updatedSchedule), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteSchedule(
  idToken: string,
  scheduleId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/schedules/${scheduleId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  scheduleId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/schedules/${scheduleId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
