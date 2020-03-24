export class SDate {
  static convertMilisecondToDateString(milisecond) {
    const date = new Date(milisecond);
    return date.toLocaleDateString('vi-VN');
  }

  static convertMilisecondToDateTimeString(milisecond) {
    const date = new Date(milisecond);
    return date.toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }
}
