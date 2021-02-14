/**
 * Fields in a request to update a single Schedule item.
 */
export interface UpdateScheduleRequest {
  name: string
  dueDate: string
  done: boolean
}