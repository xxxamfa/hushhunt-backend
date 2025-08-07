const { Expo } = require('expo-server-sdk');


const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
   
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

   
    const message = {
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data, 
    };

    try {
  
        const ticket = await expo.sendPushNotificationsAsync([message]);
        console.log('Notification ticket sent:', ticket);

    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

module.exports = { sendPushNotification };