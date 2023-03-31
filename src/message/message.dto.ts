export class MessageDto {
    text?: string
    filename?: string
    type: {
        chatId?: number,
        roomId?: number,
    }
    isInfo?: boolean
    userId: string
}