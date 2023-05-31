/**
 * 排序类型
 */
export enum TaskOrderType {
    CREATED = 'createdAt',
    PUBLISHED = 'publishedAt',
    COMMENTCOUNT = 'commentCount',
    SERIALNUMBER = 'serialNumber',
    CREATOR = 'creator',
}

/**
 * 提醒时机
 */
export enum ReminderOrderType {
    /**
     * task termination
     */
    TASKTERMINATION = 'task_termination',
    /**
     * five minutes before the end
     */
    FIVEMINUTES = 'five_minutes',
    /**
     * fifteen minutes before the end
     */
    FIFTEENMINUTES = 'fifteen_minutes',
    // ...
}
