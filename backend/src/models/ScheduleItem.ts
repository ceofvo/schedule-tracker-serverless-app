export interface ScheduleItem {
  userId: string
  scheduleId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
