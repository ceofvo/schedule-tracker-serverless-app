import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const logger = createLogger('datalayer');

const XAWS = AWSXRay.captureAWS(AWS)

import { ScheduleItem } from '../models/ScheduleItem'
import { ScheduleUpdate } from '../models/ScheduleUpdate'

export class ScheduleAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly S3 = createS3Bucket(),
    private readonly schedulesTable = process.env.SCHEDULES_TABLE,
    private readonly indexName = process.env.SCHEDULES_TABLE_INDEX,
    private readonly bucketName = process.env.SCHEDULES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  async getAllSchedules(userId: string): Promise<ScheduleItem[]> {
    console.log('Getting all Schedules')

    const result = await this.docClient.query({
        TableName: this.schedulesTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
        }, (err, data) => {
        err?logger.info("Query failed", err):logger.info('Query succeeded', data);
        }).promise();
        const items = result.Items
        return items as ScheduleItem[]
    }

  async createSchedule(schedule: ScheduleItem): Promise<ScheduleItem> {
    await this.docClient.put({
      TableName: this.schedulesTable,
      Item: schedule
    }, (err, data) => {
      err?logger.info("Insertion failed", err):logger.info('Insertion succeeded', data);
    }).promise();

    return schedule
  }


  async deleteSchedule(scheduleId: string, userId: string) {
  	await this.docClient.delete({
  		TableName: this.schedulesTable,
      Key: {userId, scheduleId}
  	}, (err, data) => {
      err?logger.info("Deletion failed", err):logger.info('Deletion succeeded', data);
    }).promise();
  	return {};
  }


  async updateSchedule(userId: string, scheduleId: string, updatedSchedule: ScheduleUpdate) {
    
    await this.docClient.update({
    TableName:this.schedulesTable,
    Key:{ userId, scheduleId},
    ExpressionAttributeNames: {"#N": "name"},
    UpdateExpression: "set #N=:scheduleName, dueDate=:dueDate, done=:done",
    ExpressionAttributeValues:{
        ":scheduleName": updatedSchedule.name,
        ":dueDate": updatedSchedule.dueDate,
        ":done": updatedSchedule.done
    },
    ReturnValues:"UPDATED_NEW"
    }, (err, data) => {
      err?logger.info("Update failed", err):logger.info('Update succeeded', data);
    }).promise();
    return {};
  }


  async generateUploadUrl(scheduleId: string, userId: string): Promise<string>{
     const uploadUrl = this.S3.getSignedUrl('putObject', {
       Bucket: this.bucketName,
       Key: scheduleId,
       Expires: this.urlExpiration
     })
     await this.docClient.update({
      TableName:this.schedulesTable,
      Key:{ userId, scheduleId},
      UpdateExpression: "set attachmentUrl=:URL",
      ExpressionAttributeValues:{
          ":URL": uploadUrl.split("?")[0]
      },
      ReturnValues:"UPDATED_NEW"
      }, (err, data) => {
        err?logger.info("Update URL failed", err):logger.info("GenerateURL and Update attachement URL", data);
      }).promise();

     return uploadUrl; 
  }
}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}


function createS3Bucket(){
  return new XAWS.S3({
  signatureVersion: 'v4'
})
}