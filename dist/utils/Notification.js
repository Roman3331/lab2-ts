export class NotificationManager {
    static async requestPermission() {
        if (Notification.permission === 'default') {
            return await Notification.requestPermission();
        }
        return Notification.permission;
    }
    static notify(title, body = '') {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
        }
    }
}
