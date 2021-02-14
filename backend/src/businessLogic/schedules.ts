import * as uuid from 'uuid'

import { ScheduleItem } from '../models/ScheduleItem'
import { ScheduleAccess } from '../dataLayer/schedulesAccess'
import { CreateScheduleRequest } from '../requests/CreateScheduleRequest'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
import { UpdateScheduleRequest } from '../requests/UpdateScheduleRequest'

const scheduleAccess = new ScheduleAccess()

export async function getAllSchedules(event: APIGatewayProxyEvent): Promise<ScheduleItem[]> {
  const userId = getUserId(event);
  return scheduleAccess.getAllSchedules(userId);
}

export async function createSchedule(event: APIGatewayProxyEvent): Promise<ScheduleItem> {
  const itemId = uuid.v4()
  const userId = getUserId(event);
  const newSchedule: CreateScheduleRequest = typeof(event.body) === 'string'?JSON.parse(event.body): event.body 

  return await scheduleAccess.createSchedule({
  	userId: userId,
  	scheduleId: itemId,
  	createdAt: new Date().toISOString(),
  	done: false,
  	...newSchedule
  })
}

export async function deleteSchedule(event: APIGatewayProxyEvent){
  const userId = getUserId(event);
  const scheduleId = event.pathParameters.scheduleId;
  return await scheduleAccess.deleteSchedule(scheduleId, userId);
}

export async function updateSchedule(event: APIGatewayProxyEvent){
  const scheduleId = event.pathParameters.scheduleId;
  const userId = getUserId(event)
  const updatedSchedule: UpdateScheduleRequest = JSON.parse(event.body);
  return await scheduleAccess.updateSchedule(userId,scheduleId,updatedSchedule);
}

export async function generateUploadUrl(event: APIGatewayProxyEvent): Promise<string>{
  const scheduleId = event.pathParameters.scheduleId;
  const userId = getUserId(event);
  return await scheduleAccess.generateUploadUrl(scheduleId, userId);
}