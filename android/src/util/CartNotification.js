import notifee, {
    AndroidImportance,
    TriggerType,
    EventType,
} from '@notifee/react-native';

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
    try {
        const settings = await notifee.requestPermission();

        console.log('Notification Permission:', settings);

        return settings;
    } catch (error) {
        console.log(
            'Notification Permission Error:',
            error
        );

        return null;
    }
};

/**
 * Create Android notification channel
 */
export const createNotificationChannel = async () => {
    try {
        const channelId = await notifee.createChannel({
            id: 'cart-reminders',
            name: 'Cart Reminders',
            description: 'Notifications for items left in cart',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        return channelId;
    } catch (error) {
        console.log(
            'Create Notification Channel Error:',
            error
        );

        return 'cart-reminders';
    }
};

/**
 * Initialize notifications
 */
export const initializeCartNotifications = async () => {
    try {
        await requestNotificationPermission();

        await createNotificationChannel();

        console.log('Cart Notifications Initialized');
    } catch (error) {
        console.log(
            'Initialize Notification Error:',
            error
        );
    }
};

/**
 * Schedule cart reminder
 *
 * Default: 30 minutes
 */
export const scheduleCartReminder = async cart => {
    try {
        if (!Array.isArray(cart) || cart.length === 0) {
            return;
        }

        // Cancel previous cart reminder
        await notifee.cancelNotification('cart-reminder');

        const itemCount = cart.length;

        const title =
            itemCount === 1
                ? 'You left an item in your cart 🛒'
                : `You have ${itemCount} items in your cart 🛒`;

        const body =
            itemCount === 1
                ? `${cart[0]?.name || 'Your selected service'} is waiting for you. Complete your booking now.`
                : 'Your selected services are waiting for you. Complete your booking now.';

        // 30 minutes from now
        const triggerTime =
            Date.now() + 30 * 60 * 1000;

        await notifee.createTriggerNotification(
            {
                id: 'cart-reminder',

                title,

                body,

                data: {
                    type: 'CART_REMINDER',
                    screen: 'ViewCartScreen',
                },

                android: {
                    channelId: 'cart-reminders',

                    importance:
                        AndroidImportance.HIGH,

                    sound: 'default',

                    pressAction: {
                        id: 'open-cart',
                    },

                    smallIcon: 'ic_launcher',

                    vibrationPattern: [
                        300,
                        500,
                        300,
                        500,
                    ],
                },

                ios: {
                    sound: 'default',
                    critical: false,
                },
            },
            {
                type: TriggerType.TIMESTAMP,
                timestamp: triggerTime,
            }
        );

        console.log(
            'Cart reminder scheduled for:',
            new Date(triggerTime)
        );
    } catch (error) {
        console.log(
            'Schedule Cart Reminder Error:',
            error
        );
    }
};

/**
 * Cancel cart reminder
 */
export const cancelCartReminder = async () => {
    try {
        await notifee.cancelNotification(
            'cart-reminder'
        );

        console.log(
            'Cart reminder cancelled'
        );
    } catch (error) {
        console.log(
            'Cancel Cart Reminder Error:',
            error
        );
    }
};