import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useColors } from '../hooks/useColors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OfflineBanner: React.FC = () => {
    const { isOnline, queueSize } = useAppSelector((state) => state.offline);
    const Colors = useColors();

    if (isOnline) return null;

    return (
        <View style={[styles.container, { backgroundColor: Colors.error + '15', borderBottomColor: Colors.border }]}>
            <Icon name="wifi-off" size={16} color={Colors.error} style={styles.icon} />
            <Text style={[styles.text, { color: Colors.error }]}>
                {queueSize > 0 
                    ? `Offline mode: ${queueSize} action${queueSize > 1 ? 's' : ''} queued`
                    : 'Offline mode: No internet connection'
                }
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default OfflineBanner;

