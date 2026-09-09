import React, { useState, useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'

// Enhanced Mobile App Component with Dark/Light Theme Support
export default function EnhancedMobileApp() {
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark'
  
  const [activeTab, setActiveTab] = useState('home')
  const [animations, setAnimations] = useState(true)

  const colors = {
    light: {
      primary: '#3b82f6',
      background: '#ffffff',
      secondary: '#f8f9fa',
      text: '#1a1a1a',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    dark: {
      primary: '#60a5fa',
      background: '#0f172a',
      secondary: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#475569',
    },
  }

  const theme = isDarkMode ? colors.dark : colors.light

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: -0.5,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    card: {
      backgroundColor: theme.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    cardText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.secondary,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingBottom: 8,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabButtonActive: {
      borderBottomWidth: 3,
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: theme.primary,
      fontWeight: '600',
    },
    statContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.secondary,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    badge: {
      display: 'flex',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    badgeGreen: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#10b981',
    },
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agency Platform</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>$89K</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>📞 New Lead</Text>
          <Text style={styles.cardText}>Create and track new leads in real-time with AI-powered scoring.</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Create Lead</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Today's Activity</Text>
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeText}>✓ On Track</Text>
          </View>
          <Text style={styles.cardText}>12 leads scored • 5 emails sent • 3 deals updated</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Performance</Text>
          <View style={{ marginBottom: 16 }}>
            <View style={{ marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Text style={styles.cardText}>Conversion Rate</Text>
                <Text style={{ ...styles.cardText, color: theme.primary }}>24.5%</Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: theme.secondary,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: '24.5%',
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 8 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Text style={styles.cardText}>Email Open Rate</Text>
                <Text style={{ ...styles.cardText, color: theme.primary }}>38.2%</Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: theme.secondary,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: '38.2%',
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
            </View>

            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Text style={styles.cardText}>Customer Retention</Text>
                <Text style={{ ...styles.cardText, color: theme.primary }}>92.1%</Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: theme.secondary,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: '92.1%',
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Full Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Links</Text>
          <TouchableOpacity style={{ marginBottom: 8 }}>
            <Text
              style={{
                ...styles.cardText,
                color: theme.primary,
                fontWeight: '600',
              }}
            >
              → Manage Workflows
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginBottom: 8 }}>
            <Text
              style={{
                ...styles.cardText,
                color: theme.primary,
                fontWeight: '600',
              }}
            >
              → View Backups
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text
              style={{
                ...styles.cardText,
                color: theme.primary,
                fontWeight: '600',
              }}
            >
              → Security Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {['home', 'leads', 'analytics', 'settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab === 'home' && '🏠'}
              {tab === 'leads' && '👥'}
              {tab === 'analytics' && '📊'}
              {tab === 'settings' && '⚙️'}
              {'\n'}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
