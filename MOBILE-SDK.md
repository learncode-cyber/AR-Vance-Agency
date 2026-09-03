# 📱 React Native Mobile SDK

**Agency Platform Mobile App Implementation Guide**

---

## 🚀 Installation

```bash
npx create-expo-app agency-app
cd agency-app

npm install expo-notifications
npm install expo-device
npm install @react-native-async-storage/async-storage
npm install react-native-mmkv
npm install axios
```

---

## 📋 Basic Setup

### 1. Device Registration

```tsx
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

async function registerDevice() {
  const token = (await Notifications.getExpoPushTokenAsync()).data
  const deviceId = Device.modelId || 'unknown'

  const response = await fetch(`${API_URL}/api/mobile/device/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId,
      deviceName: Device.deviceName,
      deviceType: Device.osName === 'iOS' ? 'ios' : 'android',
      osVersion: Device.osVersion,
      appVersion: '1.0.0',
      pushToken: token,
      userEmail: userEmail, // optional
    }),
  })

  return response.json()
}
```

### 2. Push Notifications

```tsx
import * as Notifications from 'expo-notifications'

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('Notification received:', notification)
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }
  },
})

// Listen for notifications
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data
  // Handle notification tap
  handleNotificationTap(data)
})
```

### 3. Offline Sync

```tsx
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

// Queue offline action
function queueAction(action: {
  action: 'create' | 'update' | 'delete'
  dataType: string
  endpoint: string
  payload: any
}) {
  const queue = JSON.parse(storage.getString('sync_queue') || '[]')
  queue.push(action)
  storage.set('sync_queue', JSON.stringify(queue))
}

// Sync when online
async function syncOfflineActions(deviceId: string) {
  const queue = JSON.parse(storage.getString('sync_queue') || '[]')

  if (queue.length === 0) return

  try {
    const response = await fetch(`${API_URL}/api/mobile/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        actions: queue,
      }),
    })

    if (response.ok) {
      storage.delete('sync_queue')
      console.log('Synced', queue.length, 'actions')
    }
  } catch (error) {
    console.log('Sync failed, will retry later')
  }
}
```

### 4. Analytics Tracking

```tsx
// Track screen views
function trackScreenView(screenName: string) {
  fetch(`${API_URL}/api/mobile/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: Device.modelId,
      eventName: 'screen_view',
      screenName,
    }),
  })
}

// Track custom events
function trackEvent(eventName: string, eventData?: any) {
  fetch(`${API_URL}/api/mobile/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: Device.modelId,
      eventName,
      eventData,
    }),
  })
}
```

### 5. Feature Flags

```tsx
async function getFeatureFlags() {
  const response = await fetch(
    `${API_URL}/api/mobile/feature-flags?appVersion=1.0.0&deviceType=ios&userId=${userId}`
  )
  const flags = await response.json()
  return flags.data
}

// Usage
const flags = await getFeatureFlags()
if (flags.dark_mode) {
  // Enable dark mode
}
```

### 6. Crash Reporting

```tsx
import * as ErrorUtils from 'react-native/Libraries/Core/ExceptionsManager'

const originalHandler = ErrorUtils.reportFatalError

ErrorUtils.reportFatalError = (error: Error, isFatal: boolean) => {
  // Send crash report
  fetch(`${API_URL}/api/mobile/crash-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: Device.modelId,
      appVersion: '1.0.0',
      osVersion: Device.osVersion,
      errorMessage: error.message,
      stackTrace: error.stack,
      lastScreen: currentScreen,
    }),
  })

  originalHandler(error, isFatal)
}
```

---

## 📦 App Structure

```
src/
├── components/
│   ├── ProductCard.tsx
│   ├── CartItem.tsx
│   └── ChatWidget.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── ProductsScreen.tsx
│   ├── CartScreen.tsx
│   ├── CheckoutScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ChatScreen.tsx
├── services/
│   ├── api.ts (axios setup)
│   ├── storage.ts (async storage)
│   ├── sync.ts (offline sync)
│   ├── analytics.ts (event tracking)
│   └── notifications.ts (push handling)
├── hooks/
│   ├── useProducts.ts
│   ├── useCart.ts
│   ├── useAuth.ts
│   └── useSyncQueue.ts
├── navigation/
│   └── RootNavigator.tsx
└── App.tsx
```

---

## 🔐 Authentication

```tsx
// Store token securely
import * as SecureStore from 'expo-secure-store'

async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const { token } = await response.json()
  await SecureStore.setItemAsync('auth_token', token)
}

// Include token in requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

---

## 🌐 Network Detection

```tsx
import NetInfo from '@react-native-community/netinfo'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false)

      // Sync if reconnected
      if (state.isConnected) {
        syncOfflineActions()
      }
    })

    return unsubscribe
  }, [])

  return isOnline
}
```

---

## 📊 Performance Tips

1. **Lazy Load Images** - Use `react-native-fast-image`
2. **Paginate Lists** - Implement FlatList with `onEndReached`
3. **Memoize Components** - Use `React.memo()`
4. **Optimize Re-renders** - Use `useMemo()` and `useCallback()`
5. **Compress Network** - Use gzip compression
6. **Cache Responses** - Store data locally with MMKV

---

## 🧪 Testing

```bash
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

---

## 📱 Deployment

### iOS (TestFlight)

```bash
eas build --platform ios
eas submit --platform ios
```

### Android (Play Store)

```bash
eas build --platform android
eas submit --platform android
```

---

## 🔗 API Endpoints Summary

### Device Management
- `POST /api/mobile/device/register` - Register device
- `GET /api/mobile/device/heartbeat` - Keep alive

### Sync
- `POST /api/mobile/sync` - Sync offline actions
- `GET /api/mobile/sync` - Get pending syncs

### Notifications
- `GET /api/admin/push-notifications` - List notifications
- `POST /api/admin/push-notifications` - Send notification

### Analytics
- `POST /api/mobile/analytics` - Track event
- `GET /api/mobile/analytics` - Get summary

### Feature Flags
- `GET /api/mobile/feature-flags` - Get active flags

### Crash Reporting
- `POST /api/mobile/crash-reports` - Report crash

---

**Mobile SDK Complete!** 🚀

