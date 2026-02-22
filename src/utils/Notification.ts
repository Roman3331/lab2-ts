export class NotificationManager {
  static async requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }

  static notify(title: string, body: string = '') {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}